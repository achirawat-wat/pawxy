'use client';
import { FeedbackFish } from '@feedback-fish/react';
import { MessageSquarePlus } from 'lucide-react';

export function FeedbackWidget() {
  return (
    <div className="fixed bottom-4 right-4 z-[200]">
      <FeedbackFish projectId="318ff033036327">
        <button className="flex items-center gap-2 px-3 py-2 bg-black hover:bg-gray-800 text-white rounded-full shadow-lg transition-transform active:scale-95 text-xs font-semibold border border-gray-700">
          <MessageSquarePlus size={14} />
          Feedback
        </button>
      </FeedbackFish>
    </div>
  );
}
