-- Add default options to any existing custom pages that have no options yet.

DO $$
DECLARE
    page_rec RECORD;
    option_labels TEXT[];
    option_label TEXT;
    palette TEXT[][] := ARRAY[
        ARRAY['#06d6a0', '#ffffff'],
        ARRAY['#8ce99a', '#2b5a34'],
        ARRAY['#ffe066', '#5d4e6d'],
        ARRAY['#ff9f68', '#ffffff'],
        ARRAY['#e85d75', '#ffffff'],
        ARRAY['#118ab2', '#ffffff'],
        ARRAY['#b197fc', '#ffffff'],
        ARRAY['#64748b', '#ffffff']
    ];
    option_value TEXT;
    i INT;
BEGIN
    FOR page_rec IN
        SELECT up.id, up.name
        FROM user_pages up
        WHERE up.is_builtin = FALSE
          AND NOT EXISTS (
              SELECT 1 FROM page_options po WHERE po.page_id = up.id
          )
    LOOP
        option_labels := CASE
            WHEN page_rec.name ILIKE '%water%' OR page_rec.name ILIKE '%drink%' OR page_rec.name ILIKE '%hydration%'
                THEN ARRAY['1L', '2L', '3L+', 'Less than 1L']
            WHEN page_rec.name ILIKE '%exercise%' OR page_rec.name ILIKE '%workout%' OR page_rec.name ILIKE '%gym%' OR page_rec.name ILIKE '%fitness%' OR page_rec.name ILIKE '%sport%'
                THEN ARRAY['Light', 'Moderate', 'Intense', 'Rest Day']
            WHEN page_rec.name ILIKE '%walk%' OR page_rec.name ILIKE '%steps%'
                THEN ARRAY['<5k steps', '5k-10k steps', '10k+ steps', 'Rest Day']
            WHEN page_rec.name ILIKE '%study%' OR page_rec.name ILIKE '%learn%' OR page_rec.name ILIKE '%school%' OR page_rec.name ILIKE '%college%' OR page_rec.name ILIKE '%focus%'
                THEN ARRAY['High Focus', 'Some Focus', 'Distracted', 'No Study']
            WHEN page_rec.name ILIKE '%work%' OR page_rec.name ILIKE '%job%' OR page_rec.name ILIKE '%career%' OR page_rec.name ILIKE '%task%'
                THEN ARRAY['Very Productive', 'Productive', 'Some Progress', 'Rest Day']
            WHEN page_rec.name ILIKE '%book%' OR page_rec.name ILIKE '%read%' OR page_rec.name ILIKE '%novel%' OR page_rec.name ILIKE '%reading%'
                THEN ARRAY['Book', 'Article', 'Audiobook', 'Didn''t Read']
            WHEN page_rec.name ILIKE '%mood%' OR page_rec.name ILIKE '%feel%' OR page_rec.name ILIKE '%emotion%'
                THEN ARRAY['Amazing', 'Good', 'Okay', 'Low', 'Bad']
            WHEN page_rec.name ILIKE '%sleep%' OR page_rec.name ILIKE '%rest%' OR page_rec.name ILIKE '%nap%'
                THEN ARRAY['Good Sleep', 'Okay Sleep', 'Bad Sleep', 'Insomnia']
            WHEN page_rec.name ILIKE '%health%' OR page_rec.name ILIKE '%sick%' OR page_rec.name ILIKE '%wellness%'
                THEN ARRAY['Great', 'Good', 'Tired', 'Sick', 'Pain']
            WHEN page_rec.name ILIKE '%food%' OR page_rec.name ILIKE '%meal%' OR page_rec.name ILIKE '%eat%' OR page_rec.name ILIKE '%diet%' OR page_rec.name ILIKE '%cook%'
                THEN ARRAY['Healthy', 'Average', 'Junk Food', 'Skipped']
            WHEN page_rec.name ILIKE '%habit%' OR page_rec.name ILIKE '%routine%' OR page_rec.name ILIKE '%daily%'
                THEN ARRAY['Done', 'Partial', 'Skipped', 'Rest Day']
            WHEN page_rec.name ILIKE '%money%' OR page_rec.name ILIKE '%expense%' OR page_rec.name ILIKE '%save%' OR page_rec.name ILIKE '%spend%'
                THEN ARRAY['On Budget', 'Minor Spend', 'Overspent', 'No Spend']
            WHEN page_rec.name ILIKE '%skin%' OR page_rec.name ILIKE '%face%' OR page_rec.name ILIKE '%beauty%'
                THEN ARRAY['Full Routine', 'Basic', 'Skipped']
            WHEN page_rec.name ILIKE '%hair%'
                THEN ARRAY['Washed', 'Styled', 'Treatment', 'Skipped']
            WHEN page_rec.name ILIKE '%meditation%' OR page_rec.name ILIKE '%mindful%' OR page_rec.name ILIKE '%yoga%'
                THEN ARRAY['10+ min', '5-10 min', '<5 min', 'Skipped']
            WHEN page_rec.name ILIKE '%clean%' OR page_rec.name ILIKE '%tidy%' OR page_rec.name ILIKE '%organize%'
                THEN ARRAY['Deep Clean', 'Quick Tidy', 'None']
            ELSE
                ARRAY['Done', 'Partial', 'Skipped', 'Rest Day']
        END;

        i := 0;
        FOREACH option_label IN ARRAY option_labels
        LOOP
            option_value := regexp_replace(lower(option_label), '[^a-z0-9]+', '-', 'g');
            option_value := regexp_replace(option_value, '^-+|-+$', '', 'g');

            INSERT INTO page_options (page_id, value, label, bg, color, sort_order)
            VALUES (
                page_rec.id,
                option_value,
                option_label,
                palette[(i % 8) + 1][1],
                palette[(i % 8) + 1][2],
                i
            );

            i := i + 1;
        END LOOP;
    END LOOP;
END $$;
