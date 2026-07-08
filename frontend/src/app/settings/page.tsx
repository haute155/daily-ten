'use client';

import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { ChecklistEditor } from '@/components/settings/ChecklistEditor';
import { VersionDiffCard } from '@/components/settings/VersionDiffCard';
import { VersionTimeline } from '@/components/history/VersionTimeline';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Separator } from '@/components/ui/separator';
import { AppGate } from '@/components/shared/AppGate';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { SlidersHorizontal } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AppGate>
      <SettingsPageContent />
    </AppGate>
  );
}

function SettingsPageContent() {
  const router = useRouter();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const {
    currentVersion,
    versions,
    items,
    totalScore,
    isValid,
    hasChanges,
    hasTodayEntry,
    saved,
    updateItem,
    addItem,
    removeItem,
    moveItemTo,
    reorderItems,
    handleSave,
    reset,
  } = useSettings();

  // Find the version just before current to show diff
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
  const prevVersion = sortedVersions.length > 1 ? sortedVersions[1] : null;
  const latestVersion = sortedVersions.length > 0 ? sortedVersions[0] : null;

  const isTomorrowEffective =
    !!currentVersion && currentVersion.effectiveFrom > dayjs().format('YYYY-MM-DD');

  const onSave = async () => {
    const success = await handleSave();
    if (success) {
      setIsEditorOpen(false);
    }
  };

  const onSheetOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    setIsEditorOpen(open);
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="설정"
        subtitle="나만의 채점 시스템을 설계하세요"
      />

      <div className="px-4 mb-4">
        {/* Current version info */}
        {currentVersion ? (
          <div className="p-3 rounded-md bg-brand/5 border border-brand/25 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand bg-white px-2 py-0.5 rounded-sm border border-brand/25">
                v{currentVersion.versionNumber}
              </span>
              <span className="text-sm font-semibold text-neutral-900">{currentVersion.title}</span>
            </div>
            <p className="text-xs text-brand mt-1">
              {isTomorrowEffective
                ? `${currentVersion.effectiveFrom}부터 적용 예정`
                : `${currentVersion.effectiveFrom}부터 적용 중`}
            </p>

            {/* Read-only item summary */}
            <ul className="flex flex-col gap-1 mt-3 pt-3 border-t border-brand/10">
              {currentVersion.items.map(item => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">{item.label}</span>
                  <span className="text-neutral-500 font-medium tabular-nums">{item.weight}점</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200 mb-4">
            <p className="text-sm font-semibold text-neutral-700">첫 체크리스트를 만들어 보세요</p>
            <p className="text-xs text-neutral-500 mt-1">
              항목을 추가하고 가중치 합이 10점이 되면 저장할 수 있어요.
            </p>
          </div>
        )}

        <Button
          onClick={() => setIsEditorOpen(true)}
          className="w-full h-12 text-base font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-700 text-white shadow-sm"
        >
          <SlidersHorizontal size={16} className="mr-1.5" aria-hidden="true" />
          체크리스트 편집
        </Button>
      </div>

      {/* Show diff after save */}
      {saved && latestVersion && (
        <div className="px-4 mb-4">
          <VersionDiffCard prev={prevVersion} next={latestVersion} />
        </div>
      )}

      <Separator className="mx-4 my-2" />

      {/* Version history */}
      <div className="py-4">
        <VersionTimeline versions={versions} />
      </div>

      {/* Logout */}
      <div className="px-4 pb-8">
        <button
          type="button"
          onClick={() => {
            api.logout();
            useAppStore.getState().reset();
            router.replace('/login');
          }}
          className="w-full h-11 rounded-md border border-neutral-200 text-sm text-neutral-500 hover:text-low hover:border-low/30"
        >
          로그아웃
        </button>
      </div>

      {/* Edit bottom sheet */}
      <Sheet open={isEditorOpen} onOpenChange={onSheetOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>체크리스트 편집</SheetTitle>
            <SheetDescription>
              {hasTodayEntry
                ? '변경사항은 내일부터 적용됩니다.'
                : '항목을 추가, 수정, 삭제하고 순서를 조정하세요.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <ChecklistEditor
              items={items}
              totalScore={totalScore}
              isValid={isValid}
              canSave={isValid && hasChanges}
              hasTodayEntry={hasTodayEntry}
              saved={saved}
              onItemChange={updateItem}
              onItemAdd={addItem}
              onItemRemove={removeItem}
              onItemMoveTo={moveItemTo}
              onItemReorder={reorderItems}
              onSave={onSave}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
