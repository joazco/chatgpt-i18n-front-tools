import React, { FC, useId } from "react";

interface CheckboxFieldProps {
    label: string;
    placeholder?: string;
    value?: boolean;
    onChange: (value: boolean) => void;
}
const CheckboxField: FC<CheckboxFieldProps> = (props) => {
    const { label, placeholder, value, onChange } = props;
    const id = useId();
    return (
        <>
            <input
                id={id}
                type="checkbox"
                className="block rounded-md bg-zinc-900 border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                onChange={(e) => {
                    onChange(e.target.checked);
                }}
                placeholder={placeholder}
                checked={!!value}
            />
            &nbsp;
            <label className="block text-sm font-medium leading-6 text-gray-400" htmlFor={id}>
                {label}
            </label>
        </>
    );
};

export default CheckboxField;
