import React, { useContext, useRef } from 'react';
import Link from 'next/link';
import getConfig from 'next/config';
import { StyleClass } from 'primereact/styleclass';
import { Button } from 'primereact/button';
import { Ripple } from 'primereact/ripple';
import { Divider } from 'primereact/divider';
import AppConfig from '../layout/AppConfig';
import { LayoutContext } from '../layout/context/layoutcontext';

const LandingPage = () => {
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const { layoutConfig } = useContext(LayoutContext);
    const menuRef = useRef();

    return (
        <div className="surface-0 flex justify-content-center">
            <Link href='/banners/main'>
                <Button label="Login" className="p-button-text p-button-rounded border-none font-light line-height-2 text-blue-500"></Button>
            </Link>
        </div>
    );
};

LandingPage.getLayout = function getLayout(page) {
    return (
        <React.Fragment>
            {page}
        </React.Fragment>
    );
};

export default LandingPage;
