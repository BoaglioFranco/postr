import { Box } from '@chakra-ui/react';
import React from 'react';

interface Props {
    width?: number;
}

const Wrapper: React.FC<Props> = ({children, width=800}) => {

    return (
        <Box maxW={width} marginX='auto' my={4}>
            {children}
        </Box>
    );
}

export default Wrapper;