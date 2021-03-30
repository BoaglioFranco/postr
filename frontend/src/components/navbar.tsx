import { Box, Flex, Link, Button, Heading } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface Props {}

const Navbar: React.FC<Props> = (props) => {
  const router = useRouter();
  const [ logout, { loading: logoutFetching }] = useLogoutMutation();
const query = useMeQuery({ skip: isServer() /*doesnt execute the query if value is true*/});
  let body;

   if (query.loading || !query.data?.me) {
    body = (
      <Flex alignItems='center'>
        <NextLink href="/login">
          <Link px={2} color="white">
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link px={2} color="white">
            Register
          </Link>
        </NextLink>
      </Flex>
    );
  } else {
    body = (
      <Flex alignItems='center'>
        <Box px={2} color="white">
          {query.data.me.username}
        </Box>
        <Button
          px={2}
          variant="link"
          color="gray.200"
          isLoading={logoutFetching}
          onClick={() => {
            logout();
            router.reload();
          }}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Box background="teal.400" zIndex='1' position='sticky' top='0'>
      <Flex p={4} justify="space-around" maxW="1500px" m="auto" >
        <NextLink href='/'><Link><Box background='white'  borderRadius='8px' padding={2} ><Heading color='#16d9a1'>POSTR</Heading></Box></Link></NextLink>
        {body}
      </Flex>
    </Box>
  );
};

export default Navbar;
