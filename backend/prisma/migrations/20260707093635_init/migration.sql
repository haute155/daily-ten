-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_versions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "total_score" INTEGER NOT NULL,
    "change_summary" TEXT NOT NULL DEFAULT '',
    "effective_from" TEXT NOT NULL,
    "effective_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "checklist_version_id" TEXT NOT NULL,
    "checked_item_ids" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_versions_user_id_version_number_key" ON "checklist_versions"("user_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "daily_entries_user_id_date_key" ON "daily_entries"("user_id", "date");

-- AddForeignKey
ALTER TABLE "checklist_versions" ADD CONSTRAINT "checklist_versions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_entries" ADD CONSTRAINT "daily_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_entries" ADD CONSTRAINT "daily_entries_checklist_version_id_fkey" FOREIGN KEY ("checklist_version_id") REFERENCES "checklist_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
