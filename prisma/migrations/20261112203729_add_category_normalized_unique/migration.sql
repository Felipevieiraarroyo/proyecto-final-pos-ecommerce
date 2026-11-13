
CREATE UNIQUE INDEX "Category_name_normalized_key"
ON "Category" (LOWER(TRIM("name")));
