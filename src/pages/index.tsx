import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface GetImagesResponse {
  data: {
    id: string;
    title: string;
    description: string;
    url: string;
  }[];
  after: null | true;
}

export default function Home(): JSX.Element {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: 'images',
    queryFn: async ({ pageParam = null }) => {
      if (pageParam) {
        const response = await api.get<GetImagesResponse>('/api/images', {
          params: {
            after: pageParam,
          },
        });

        return response.data;
      }

      const response = await api.get<GetImagesResponse>('/api/images');

      return response.data;
    },
    getNextPageParam: lastPage => lastPage.after ?? null,
  });

  const formattedData = useMemo(() => {
    return data?.pages.map(item => item.data).flat();
  }, [data]);

  return (
    <>
      {isLoading ? <Loading /> : isError && <Error />}

      {!isLoading && !isError && (
        <>
          <Header />

          <Box maxW={1120} px={20} mx="auto" my={20}>
            <CardList cards={formattedData} />

            {hasNextPage && (
              <Button
                mt="1rem"
                onClick={() => fetchNextPage()}
                role="button"
                w={['100%', 'auto']}
              >
                {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
              </Button>
            )}
          </Box>
        </>
      )}
    </>
  );
}
