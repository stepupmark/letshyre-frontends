import { FC } from "react";

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput: FC<FileInputProps> = ({ className, onChange }) => {
  return (
    <input
      type="file"
      className={`h-11 w-full overflow-hidden rounded-lg border border-input bg-transparent text-sm text-muted-foreground shadow-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-border file:bg-muted/50 file:py-3 file:pr-3 file:pl-3.5 file:text-sm file:text-foreground placeholder:text-muted-foreground hover:file:bg-accent focus:border-ring focus:outline-hidden focus:file:ring-ring/50 dark:bg-input/30 ${className}`}
      onChange={onChange}
    />
  );
};

export default FileInput;
