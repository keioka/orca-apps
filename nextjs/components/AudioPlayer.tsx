export function AudioPlayer({ file, autoPlay }: { file: string, autoPlay?: boolean }) {
  return (
    <audio src={file} controls autoPlay={autoPlay} style={{ width: "100%" }} />
  );
}