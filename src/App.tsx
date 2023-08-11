import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { LangingPage, NotFound, Settings, TextServicePage } from "./pages";
import { useGlobalStore } from "./store";
import FormProvider from "./store/form";

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <LangingPage />,
    },
    {
        path: "/translate",
        element: <TextServicePage service="translation" />,
    },
    {
        path: "/spelling-correction",
        element: <TextServicePage service="spelling-correction" />,
    },
    {
        path: "/rewrite-text",
        element: <TextServicePage service="rewrite-text" />,
    },
    {
        path: "/settings",
        element: <Settings />,
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);

export default function (props: { children?: React.ReactNode }) {
    const { commonStore } = useGlobalStore();
    useEffect(() => {
        commonStore.loadConfig();
    }, []);
    return (
        <FormProvider>
            <RouterProvider router={appRouter} />
        </FormProvider>
    );
}

// export default appRouter;
