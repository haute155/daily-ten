'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useHistoryEntry } from '@/hooks/useHistory';
import { calculateScore } from '@/lib/domain/scoring';
import { resolveActiveVersion } from '@/lib/domain/versioning';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronLeft, AlertCircle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AppGate } from '@/components/shared/AppGate';

dayjs.locale('ko');

export default function HistoryDatePage() {
  return (
    <AppGate>
      <HistoryDateContent />
    </AppGate>
  );
}

function HistoryDateContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = params.date as string;

  const { entry, versions, updateEntryByDate } = useHistoryEntry(date);

  const isToday = date === dayjs().format('YYYY-MM-DD');
  const isFuture = dayjs(date).isAfter(dayjs(), 'day');

  // 기본 레시피: 기존 기록의 버전 > 그 날짜에 적용되던 버전 > 가장 오래된 버전
  // (첫 레시피 생성 이전 날짜도 레시피를 골라 입력할 수 있게)
  const oldestVersion =
    versions.length > 0
      ? versions.reduce((a, b) => (b.versionNumber < a.versionNumber ? b : a))
      : null;
  const defaultVersionId =
    entry?.checklistVersionId ??
    resolveActiveVersion(versions, date)?.id ??
    oldestVersion?.id ??
    null;

  // 과거 미기록 날짜도 "지금이라도 입력" 가능 (당시 적용 가능한 레시피가 있을 때)
  const canWrite = !isFuture && defaultVersionId !== null;

  // 미리보기 [수정하기]/[지금이라도 입력하기]로 진입하면 (?edit=1) 바로 편집 모드
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === '1' && canWrite);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(defaultVersionId);
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>(entry?.checkedItemIds ?? []);
  const [note, setNote] = useState(entry?.note ?? '');

  const version = versions.find(v => v.id === selectedVersionId) ?? null;
  const currentScore = version ? calculateScore(checkedItemIds, version) : (entry?.score ?? 0);
  const isCreate = !entry;

  const toggleItem = (id: string) => {
    if (!isEditing) return;
    setCheckedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleVersionChange = (versionId: string) => {
    setSelectedVersionId(versionId);
    // 레시피가 바뀌면 그 레시피에 존재하는 항목의 체크만 유지
    const next = versions.find(v => v.id === versionId);
    const validIds = new Set(next?.items.map(i => i.id) ?? []);
    setCheckedItemIds(prev => prev.filter(id => validIds.has(id)));
  };

  const handleEdit = () => {
    setCheckedItemIds(entry?.checkedItemIds ?? []);
    setNote(entry?.note ?? '');
    setSelectedVersionId(defaultVersionId);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedVersionId(defaultVersionId);
    setCheckedItemIds(entry?.checkedItemIds ?? []);
    setNote(entry?.note ?? '');
  };

  const handleSave = async () => {
    if (!selectedVersionId) return;
    try {
      await updateEntryByDate(date, checkedItemIds, note, selectedVersionId);
      setIsEditing(false);
      toast.success(isCreate ? '기록 완료!' : '수정 완료!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '저장에 실패했습니다');
    }
  };

  const formattedDate = dayjs(date).format('YYYY년 M월 D일 dddd');

  // 기록도 없고 작성도 불가능한 날짜 (미래 or 레시피가 없던 시절)
  if (!entry && (!canWrite || !version)) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 px-4 pt-6 pb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-md hover:bg-neutral-100 flex items-center justify-center"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-neutral-900">{formattedDate}</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center mb-4">
            <AlertCircle size={28} className="text-neutral-300" aria-hidden="true" />
          </div>
          <p className="text-base font-semibold text-neutral-500">기록할 수 없는 날이에요</p>
          <p className="text-sm text-neutral-400 mt-1">
            {isFuture ? '미래 날짜입니다.' : '이 날짜에 적용할 수 있는 레시피가 없어요.'}
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => router.push('/today')}
          >
            오늘 기록하러 가기
          </Button>
        </div>
      </div>
    );
  }

  const activeItems = (version?.items ?? []).filter(item => item.isActive);
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-6 pb-2">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-md hover:bg-neutral-100 flex items-center justify-center"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-neutral-900">{formattedDate}</h1>
          {version && !isEditing && (
            <p className="text-xs text-neutral-400">레시피 v{version.versionNumber}</p>
          )}
        </div>
        <ScoreBadge score={isEditing || isCreate ? currentScore : entry!.score} size="lg" />
      </div>

      {/* Not-today disclaimer */}
      {!isToday && (
        <div className="mx-4 mb-3 flex items-start gap-2 px-3 py-2 rounded-md bg-neutral-100 border border-neutral-200">
          <AlertCircle size={13} className="text-neutral-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-neutral-700">당일 기록을 권장합니다. 지난 기록 작성·수정은 참고용으로만 사용하세요.</p>
        </div>
      )}

      {/* 레시피 선택 (편집 모드에서만) */}
      {isEditing && (
        <div className="mx-4 mb-3 flex items-center gap-2">
          <label htmlFor="recipe-select" className="text-xs font-medium text-neutral-500 flex-shrink-0">
            레시피
          </label>
          <select
            id="recipe-select"
            value={selectedVersionId ?? ''}
            onChange={e => handleVersionChange(e.target.value)}
            className="flex-1 h-9 text-sm rounded-md border border-neutral-200 bg-white px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            {sortedVersions.map(v => (
              <option key={v.id} value={v.id}>
                레시피 v{v.versionNumber} ({dayjs(v.effectiveFrom).format('M.D')}
                {v.effectiveTo ? ` ~ ${dayjs(v.effectiveTo).format('M.D')}` : ' ~ 현재'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Checklist items */}
      <div className="flex flex-col gap-2 px-4 mt-2">
        {activeItems.map(item => {
          const isChecked = isEditing || isCreate
            ? checkedItemIds.includes(item.id)
            : entry!.checkedItemIds.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              disabled={!isEditing}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-md border-2 transition-all text-left',
                isChecked
                  ? 'bg-success/5 border-success/25'
                  : 'bg-white border-neutral-100',
                isEditing && 'hover:border-neutral-200 active:scale-[0.98]'
              )}
              aria-pressed={isChecked}
              aria-label={`${item.label} (${item.weight}점) - ${isChecked ? '완료' : '미완료'}`}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0',
                  isChecked ? 'bg-success border-success' : 'border-neutral-300'
                )}
                aria-hidden="true"
              >
                {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
              <span className={cn('flex-1 font-medium text-sm', isChecked ? 'text-neutral-800' : 'text-neutral-400')}>
                {item.label}
              </span>
              <span className={cn(
                'text-sm font-semibold px-2 py-0.5 rounded-sm',
                isChecked ? 'bg-success/10 text-success' : 'bg-neutral-100 text-neutral-400'
              )}>
                +{item.weight}
              </span>
            </button>
          );
        })}
      </div>

      {/* Note */}
      <div className="px-4 mt-3">
        {isEditing ? (
          <Textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="메모 (선택사항)"
            className="resize-none text-sm bg-white border-neutral-100 rounded-md"
            rows={2}
            aria-label="메모"
          />
        ) : (
          entry?.note && (
            <div className="px-4 py-3 rounded-md bg-neutral-50 border border-neutral-100">
              <p className="text-xs text-neutral-400 mb-1">메모</p>
              <p className="text-sm text-neutral-700">{entry.note}</p>
            </div>
          )
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 mt-4 pb-8">
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-md"
              onClick={handleCancel}
            >
              취소
            </Button>
            <Button
              className="flex-1 h-11 rounded-md bg-neutral-900 hover:bg-neutral-700 text-white"
              onClick={handleSave}
            >
              {isCreate ? '기록 저장' : '저장'}
            </Button>
          </div>
        ) : isCreate ? (
          <Button
            className="w-full h-11 rounded-md bg-neutral-900 hover:bg-neutral-700 text-white"
            onClick={handleEdit}
          >
            <Pencil size={13} className="mr-1.5" aria-hidden="true" />
            지금이라도 입력하기
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full h-11 rounded-md"
            onClick={handleEdit}
          >
            <Pencil size={13} className="mr-1.5" aria-hidden="true" />
            수정하기
          </Button>
        )}
      </div>
    </div>
  );
}
