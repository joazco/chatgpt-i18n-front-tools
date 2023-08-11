import { useEffect, useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import DropdownSelect, { IDropdownSelectOption, IDropdownSelectProps } from "./dropdownSelect";
import { useGlobalStore } from "../store";

interface DropdownModelProps extends Omit<IDropdownSelectProps, "options"> {}

const DropdownModel: React.FC<DropdownModelProps> = (props) => {
    const { commonStore } = useGlobalStore();
    const [options, setOptions] = useState<IDropdownSelectOption[]>([]);

    useEffect(() => {
        if (!commonStore.config.apiKey) return () => {};
        const configuration = new Configuration({
            apiKey: commonStore.config.apiKey,
        });
        const openai = new OpenAIApi(configuration);
        openai.listModels().then((response) => {
            console.log(response.data);
            setOptions(response.data.data.map((d) => ({ label: d.id, value: d.id })));
        });
    }, [commonStore.config.apiKey]);

    return <DropdownSelect options={options} {...props} />;
};

export default DropdownModel;
