export function AudioPlayer({ file }: { file: string }) {
  console.log({ file })
  return (
    <audio src={file} controls style={{ width: "100%" }} />
  );
}