import React from 'react';
import Navbar from './navbar';
import Wrapper from './Wrapper';

interface Props {
    containerWidth?: number;
}

const Layout: React.FC<Props> = ({containerWidth = 600, children}) => {

    return (
        <>
        <Navbar></Navbar>
        <Wrapper width={containerWidth}>{children}</Wrapper>
        </>
    );
}

export default Layout;