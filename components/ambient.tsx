/** Soft drifting gradient blobs plus film grain. Pure CSS, GPU-friendly. */
export function Ambient() {
  return (
    <div className="ambient" aria-hidden>
      <div className="blob blob-peach" />
      <div className="blob blob-lilac" />
      <div className="blob blob-rose" />
      <div className="grain" />
    </div>
  );
}
