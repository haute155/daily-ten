'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useHistoryEntry } from '@/hooks/useHistory';
import { calculateScore } from '@/lib/domain/scoring';
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
  const date = params.date as string;

  const { entry, version, updateEntryByDate } = useHistoryEntry(date);

  const [isEditing, setIsEditing] = useState(false);
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>(
    entry?.checkedItemIds ?? []
  );
  const [note, setNote] = useState(entry?.note ?? '');

  const currentScore = version
    ? calculateScore(checkedItemIds, version)
    : entry?.score ?? 0;

  const isToday = date === dayjs().format('YYYY-MM-DD');
  const isFuture = dayjs(date).isAfter(dayjs(), 'day');

  const toggleItem = (id: string) => {
    if (!isEditing) return;
    setCheckedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleEdit = () => {
    setCheckedItemIds(entry?.checkedItemIds ?? []);
    setNote(entry?.note ?? '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateEntryByDate(date, checkedItemIds, note);
      setIsEditing(false);
      toast.success('수정 완료!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '저장에 실패했습니다');
    }
  };

  const formattedDate = dayjs(date).format('YYYY년 M월 D일 dddd');

  if (!entry || !version) {
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
          <p className="text-base font-semibold text-neutral-500">기록이 없어요</p>
          <p className="text-sm text-neutral-400 mt-1">
            {isFuture ? '미래 날짜입니다.' : '이 날은 기록을 남기지 않았어요.'}
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

  const activeItems = version.items.filter(item => item.isActive);

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
          <p className="text-xs text-neutral-400">{version.title} (v{version.versionNumber})</p>
        </div>
        <ScoreBadge score={isEditing ? currentScore : entry.score} size="lg" />
      </div>

      {/* Not-today disclaimer */}
      {!isToday && (
        <div className="mx-4 mb-3 flex items-start gap-2 px-3 py-2 rounded-md bg-neutral-100 border border-neutral-200">
          <AlertCircle size={13} className="text-neutral-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-neutral-700">당일 기록을 권장합니다. 과거 기록 수정은 참고용으로만 사용하세요.</p>
        </div>
      )}

      {/* Checklist items */}
      <div className="flex flex-col gap-2 px-4 mt-2">
        {activeItems.map(item => {
          const isChecked = isEditing
            ? checkedItemIds.includes(item.id)
            : entry.checkedItemIds.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              disabled={!isEditing}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-md border-2 transition-all text-left',
                isChecked
                  ? 'bg-brand/5 border-brand/25'
                  : 'bg-white border-neutral-100',
                isEditing && 'hover:border-neutral-200 active:scale-[0.98]'
              )}
              aria-pressed={isChecked}
              aria-label={`${item.label} (${item.weight}점) - ${isChecked ? '완료' : '미완료'}`}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0',
                  isChecked ? 'bg-brand border-brand' : 'border-neutral-300'
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
                isChecked ? 'bg-brand/10 text-brand' : 'bg-neutral-100 text-neutral-400'
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
          entry.note && (
            <div className="px-4 py-3 rounded-md bg-neutral-50 border border-neutral-100">
              <p className="text-xs text-neutral-400 mb-1">메모</p>
              <p className="text-sm text-neutral-700">{entry.note}</p>
            </div>
          )
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 mt-4">
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-md"
              onClick={() => setIsEditing(false)}
            >
              취소
            </Button>
            <Button
              className="flex-1 h-11 rounded-md bg-neutral-900 hover:bg-neutral-700 text-white"
              onClick={handleSave}
            >
              저장
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-11 rounded-md gap-2"
            onClick={handleEdit}
          >
            <Pencil size={14} aria-hidden="true" />
            수정하기
          </Button>
        )}
      </div>

      {/* Timestamps */}
      <div className="px-4 mt-4 pb-4">
        <p className="text-xs text-neutral-300 text-center">
          기록: {dayjs(entry.createdAt).format('YYYY.MM.DD HH:mm')}
          {entry.updatedAt !== entry.createdAt && ` · 수정: ${dayjs(entry.updatedAt).format('HH:mm')}`}
        </p>
      </div>
    </div>
  );
}
