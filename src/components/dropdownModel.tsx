import { useEffect, useState } from "react";
import OpenAI from "openai";

import DropdownSelect, { IDropdownSelectOption, IDropdownSelectProps } from "./dropdownSelect";
import { useGlobalStore } from "../store";

interface DropdownModelProps extends Omit<IDropdownSelectProps, "options"> {}

let requestLoading = false;

const DropdownModel: React.FC<DropdownModelProps> = (props) => {
    const { commonStore } = useGlobalStore();
    const [options, setOptions] = useState<IDropdownSelectOption[]>([]);

    useEffect(() => {
        if (!commonStore.config.apiKey || !!requestLoading || options.length > 0) return () => {};
        requestLoading = true;
        const openai = new OpenAI({ apiKey: commonStore.config.apiKey, dangerouslyAllowBrowser: true });
        openai.models
            .list()
            .then((response) => {
                setOptions(response.data.map((d) => ({ label: d.id, value: d.id })));
            })
            .finally(() => (requestLoading = false));
    }, [commonStore.config.apiKey]);

    return <DropdownSelect options={options} {...props} className="w-56" />;
};

export default DropdownModel;
