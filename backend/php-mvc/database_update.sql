-- Step 2: Fix schema for tables.table_number
-- Converts table_number from INT to VARCHAR to support values like 'T1-01' and 'OUT-03'.

ALTER TABLE tables
    MODIFY COLUMN table_number VARCHAR(50) NOT NULL;
