export default function Leftside() {
  return (
    <div
      className="w-full h-full p-4
      bg-linear-to-tr from-teal-600/60 to-black
      flex flex-col justify-between
      max-lg:hidden overflow-hidden"
    >
      <div>
        <h1 className="text-3xl text-slate-300">perpx</h1>
      </div>

      <div className="space-y-10">
        <div className="w-full h-fit flex gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-1/3 h-40 bg-teal-950 text-5xl flex items-center justify-center rounded"
            >
              {i}
            </div>
          ))}
        </div>

        <div>
          <h1 className="text-6xl text-teal-100">
            Build smarter,
            <br />
            <i>
              ship faster with <sup>AI</sup>{' '}
            </i>
          </h1>
        </div>
      </div>
    </div>
  );
}
