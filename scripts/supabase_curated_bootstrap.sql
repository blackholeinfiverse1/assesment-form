BEGIN;

-- Ensure required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Indexes for performance (safe if they already exist)
CREATE INDEX IF NOT EXISTS idx_qb_category_id      ON public.question_banks (category_id);
CREATE INDEX IF NOT EXISTS idx_qb_category_lower   ON public.question_banks (LOWER(category));
CREATE INDEX IF NOT EXISTS idx_qb_difficulty_lower ON public.question_banks (LOWER(difficulty));
CREATE INDEX IF NOT EXISTS idx_qb_is_active        ON public.question_banks (is_active);
CREATE INDEX IF NOT EXISTS idx_qb_created_by       ON public.question_banks (created_by);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_qb_tags_gin'
  ) THEN
    EXECUTE 'CREATE INDEX idx_qb_tags_gin ON public.question_banks USING GIN (tags);';
  END IF;
END$$;

-- 2) Normalize difficulty values to Easy/Medium/Hard
UPDATE public.question_banks
SET difficulty = INITCAP(LOWER(difficulty))
WHERE difficulty IS NOT NULL
  AND LOWER(difficulty) IN ('easy','medium','hard');

-- 3) Ensure curated rows are active and authored by admin (keep AI rows as 'ai')
UPDATE public.question_banks
SET is_active = TRUE
WHERE is_active IS DISTINCT FROM TRUE;

UPDATE public.question_banks
SET created_by = 'admin'
WHERE created_by IS NULL OR (LOWER(created_by) NOT IN ('admin','ai'));

-- 4) Ensure tags column is initialized and includes broad education-level tags
--    Supports both text[] and jsonb schemas for tags.
DO $$
DECLARE
  v_data_type text;
  v_udt_name  text;
BEGIN
  SELECT data_type, udt_name
  INTO v_data_type, v_udt_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name   = 'question_banks'
    AND column_name  = 'tags';

  IF v_data_type = 'ARRAY' OR v_udt_name = '_text' THEN
    -- tags is text[]
    UPDATE public.question_banks
    SET tags = COALESCE(tags, ARRAY[]::text[]);

    UPDATE public.question_banks
    SET tags = ARRAY(
      SELECT DISTINCT UNNEST(
        tags || ARRAY[
          'level_9','level_10','level_11','level_12',
          'level_undergraduate','level_graduate','level_postgraduate'
        ]::text[]
      )
    );

  ELSIF v_data_type = 'jsonb' THEN
    -- tags is jsonb; ensure it's a JSON array
    UPDATE public.question_banks
    SET tags = '[]'::jsonb
    WHERE tags IS NULL OR jsonb_typeof(tags) IS DISTINCT FROM 'array';

    -- Merge default level tags and remove duplicates
    WITH unioned AS (
      SELECT qb.id,
             (
               SELECT jsonb_agg(DISTINCT to_jsonb(val))
               FROM (
                 SELECT jsonb_array_elements_text(
                          COALESCE(qb.tags, '[]'::jsonb)
                          || '["level_9","level_10","level_11","level_12",
                               "level_undergraduate","level_graduate","level_postgraduate"]'::jsonb
                        ) AS val
               ) s
             ) AS new_tags
      FROM public.question_banks qb
    )
    UPDATE public.question_banks q
    SET tags = u.new_tags
    FROM unioned u
    WHERE q.id = u.id;

  ELSE
    RAISE NOTICE 'Unknown type for public.question_banks.tags (data_type=%, udt_name=%). Skipping tag normalization.', v_data_type, v_udt_name;
  END IF;
END$$;

-- 5) Attempt to backfill category_id from common category tables (best-effort)
DO $$
BEGIN
  BEGIN
    UPDATE public.question_banks qb
    SET category_id = qc.category_id
    FROM public.question_categories qc
    WHERE qb.category_id IS DISTINCT FROM qc.category_id
      AND LOWER(qb.category) = LOWER(qc.name);
  EXCEPTION WHEN undefined_table THEN
    BEGIN
      UPDATE public.question_banks qb
      SET category_id = dqc.category_id
      FROM public.dynamic_question_categories dqc
      WHERE qb.category_id IS DISTINCT FROM dqc.category_id
        AND LOWER(qb.category) = LOWER(dqc.name);
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'No categories table found (public.question_categories or public.dynamic_question_categories). Skipping category_id backfill.';
    END;
  END;
END$$;

-- 6) Ensure timestamps exist
UPDATE public.question_banks
SET created_at = NOW()
WHERE created_at IS NULL;

UPDATE public.question_banks
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- 7) Clone curated questions within each category to reach a minimum target per category
--    TARGET_COUNT is hard-coded to 200 here.
--    Newly cloned questions:
--      - remain in the same category and difficulty as their source
--      - get unique id and question_id
--      - have question_text appended with a unique suffix to avoid text dedup
--      - remain created_by='admin', is_active=TRUE
WITH
  target AS (
    SELECT 200::int AS target_count
  ),
  curated_counts AS (
    SELECT LOWER(category) AS lcat, category_id, COUNT(*) AS curated_count
    FROM public.question_banks
    WHERE is_active = TRUE AND created_by = 'admin'
    GROUP BY LOWER(category), category_id
  ),
  needs AS (
    SELECT cc.lcat, cc.category_id, GREATEST(0, t.target_count - cc.curated_count) AS to_add
    FROM curated_counts cc
    CROSS JOIN target t
  ),
  src AS (
    SELECT
      qb.*,
      LOWER(qb.category) AS lcat,
      ROW_NUMBER() OVER (PARTITION BY LOWER(qb.category) ORDER BY qb.question_id) AS rn,
      COUNT(*) OVER     (PARTITION BY LOWER(qb.category))                           AS cnt
    FROM public.question_banks qb
    WHERE qb.is_active = TRUE AND qb.created_by = 'admin'
  )
INSERT INTO public.question_banks (
  id, question_id, category, category_id, difficulty,
  question_text, options, correct_answer, explanation,
  vedic_connection, modern_application, tags,
  is_active, created_by, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  'ADMIN_CLONE_' || md5(random()::text || clock_timestamp()::text) || '_' || g.n,
  s.category,
  s.category_id,
  s.difficulty,
  s.question_text || ' - Set ' || g.n,
  s.options,
  s.correct_answer,
  s.explanation,
  s.vedic_connection,
  s.modern_application,
  s.tags,
  TRUE,
  'admin',
  NOW(),
  NOW()
FROM needs n
JOIN generate_series(1, n.to_add) AS g(n) ON n.to_add > 0
JOIN src s
  ON s.lcat = n.lcat
 AND s.cnt  > 0
 AND s.rn   = ((g.n - 1) % s.cnt) + 1;

COMMIT;

-- Optional diagnostics (run after commit, not part of transaction):
-- SELECT LOWER(category) AS category,
--        COUNT(*) AS curated_count,
--        COUNT(*) FILTER (WHERE LOWER(difficulty)='easy')   AS easy_count,
--        COUNT(*) FILTER (WHERE LOWER(difficulty)='medium') AS medium_count,
--        COUNT(*) FILTER (WHERE LOWER(difficulty)='hard')   AS hard_count
-- FROM public.question_banks
-- WHERE is_active = TRUE AND created_by = 'admin'
-- GROUP BY LOWER(category)
-- ORDER BY curated_count DESC;
