import { Link } from "@tanstack/react-router";
import { TeaCupArt } from "./art";

type Props = {
  loveeName: string;
  pendingBucketTitle?: string;
};

export function MomentPrompt({ loveeName, pendingBucketTitle }: Props) {
  return (
    <Link to="/moments" className="block">
      <div className="polaroid-left bg-card border border-border p-5 pb-7 shadow-paper paper-grain rounded-md hover:rotate-0 transition-transform duration-700">
        <div className="aspect-[5/3] rounded-sm bg-gradient-sage flex items-center justify-center">
          <TeaCupArt />
        </div>
        {pendingBucketTitle ? (
          <>
            <h3 className="font-serif text-2xl italic leading-snug mt-5">
              From your list: {pendingBucketTitle}
            </h3>
            <p className="font-hand text-xl text-foreground/70 mt-2 leading-snug">
              you planned this together — today could be the day.
            </p>
          </>
        ) : (
          <>
            <h3 className="font-serif text-2xl italic leading-snug mt-5">
              Share a quiet cup of tea with {loveeName}.
            </h3>
            <p className="font-hand text-xl text-foreground/70 mt-2 leading-snug">
              small, ordinary moments often become the ones we treasure most.
            </p>
          </>
        )}
      </div>
    </Link>
  );
}
