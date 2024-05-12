import React, { FC, useId } from "react";

interface ITextFieldProps {
    label: string;
    placeholder?: string;
    value?: string;
    type?: "text" | "number";
    full?: boolean;
    onChange: (value: string) => void;
}
const TextField: FC<ITextFieldProps> = (props) => {
    const { label, placeholder, value, type = "text", full = true, onChange } = props;
    const id = useId();
    return (
        <div>
            <div className="flex justify-between">
                <label className="block text-sm font-medium leading-6 text-gray-400" htmlFor={id}>
                    {label}
                </label>
            </div>
            <input
                type={type}
                id={id}
                className={`block ${
                    !!full && "w-full"
                } rounded-md bg-zinc-900 border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
            />
        </div>
    );
};

export default TextField;
