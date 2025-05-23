export default function PinnedHeader() {
  return (
    <h2 className="text-responsive-display flex flex-wrap items-center justify-end gap-x-2 gap-y-1 font-black leading-[1.4]">
      <span className="text-block">📌</span>
      <hr className="border-reverse flex-1 border" />
      <span className="text-block bg-reverse text-reverse border-reverse border-2">
        Pinned
      </span>
      <span className="text-block border-reverse border-2">Posts</span>
    </h2>
  );
}
