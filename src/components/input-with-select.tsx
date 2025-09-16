import type * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface InputWithSelectProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  selectProps?: {
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
  };
  selectOptions: Array<{ value: string; label: string }>;
  className?: string;
}

export function InputWithSelect({
  inputProps,
  selectProps,
  selectOptions,
  className,
}: InputWithSelectProps) {
  return (
    <div className={cn("flex", className)}>
      <Input
        {...inputProps}
        className={cn(
          "rounded-r-none border-r-0 focus-visible:z-10",
          inputProps?.className
        )}
      />
      <Select {...selectProps}>
        <SelectTrigger className="w-auto min-w-[120px] rounded-l-none focus:z-10">
          <SelectValue placeholder={selectProps?.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {selectOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
