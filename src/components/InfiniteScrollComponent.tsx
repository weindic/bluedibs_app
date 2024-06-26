import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { Flex, Loader, LoadingOverlay, SimpleGrid } from "@mantine/core";
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useInView } from "framer-motion";
import React, { ElementRef, useEffect, useMemo, useRef } from "react";

type Props = {
  queryKey: QueryKey;
  queryFn: (page: number) => Promise<any>;
  children: (
    data: any,
    virtualItem: any,
    d: { data: InfiniteData<any> | undefined; page: number }
  ) => React.ReactElement;
  startIndex?: number | null;
  cols?: number;
  virtual?: boolean;
  withPullToRefresh?: boolean;
  initialData?: any;
  gap?: number;
};

function InfiniteScrollComponent({
  queryFn,
  queryKey,
  children,
  startIndex,
  cols = 1,
  virtual = true,
  withPullToRefresh = true,
  initialData,
  gap = 2,
}: Props) {
  const parentRef = useRef<ElementRef<"div">>(null);
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery(
    queryKey,
    async ({ pageParam: page = 0 }) => queryFn(page),
    {
      getNextPageParam: ({ page, perPage, total }) => {
        if ((page + 1) * perPage >= total) return undefined;
        return page + 1;
      },

      refetchOnMount: false,
    }
  );

  useEffect(() => {
    if (initialData) {
      queryClient.setQueryData(queryKey, () => initialData);
    }

    queryClient.invalidateQueries(queryKey);
  }, [initialData]);

  const flattenedData = useMemo(() => {
    const arr: any[] = [];

    const pages = data?.pages ?? [];

    pages.forEach((page: any, index) => {
      const pageData = page.posts ?? page.data ?? [];

      pageData.forEach((data: any) => {
        arr.push({ ...data, pageNumber: index });
      });
    });

    return arr;
  }, [data]);

  const virtualizer = useVirtualizer({
    count: hasNextPage ? flattenedData.length + 1 : flattenedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: React.useCallback(
      (index: number) => {
        if (hasNextPage && index > flattenedData.length - 1) return 75;
        return 375;
      },
      [flattenedData, hasNextPage]
    ),

    overscan: 5,
  });

  useEffect(() => {
    if (typeof startIndex == "number" && flattenedData.length && virtual) {
      virtualizer.scrollToIndex(startIndex, {
        align: "start",
      });
    }
  }, [flattenedData, startIndex, virtual]);

  return (
    <div
      ref={parentRef}
      style={
        virtual
          ? {
              height: "100%",
              width: "100%",
              overflowY: "auto",
              contain: "strict",
            }
          : {}
      }
    >
      {withPullToRefresh && (
        <IonRefresher
          slot="fixed"
          onIonRefresh={(evt) => {
            refetch().then(() => {
              evt.detail.complete();
            });
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
      )}

      <LoadingOverlay visible={isLoading} />

      <div
        style={
          virtual
            ? {
                height: virtualizer.getTotalSize(),
                width: "100%",
                position: "relative",
              }
            : {}
        }
      >
        <SimpleGrid
          cols={cols}
          spacing={virtual ? 0 : gap}
          p={virtual ? 0 : "xs"}
          style={
            virtual
              ? {
                  width: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: `translateY(${
                    virtualizer.getVirtualItems()[0]?.start ?? 0
                  }px)`,
                }
              : {}
          }
        >
          {virtual ? (
            <>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const isLastRow = virtualItem.index > flattenedData.length - 1;

                if (isLastRow && hasNextPage) {
                  return (
                    <NextPageFetcher
                      key={virtualItem.index}
                      start={virtualItem.start}
                      hasNextPage={hasNextPage}
                      isFetchingNextPage={isFetchingNextPage}
                      fetchNextPage={fetchNextPage}
                    />
                  );
                }

                return (
                  <div
                    ref={virtualizer.measureElement}
                    key={flattenedData[virtualItem.index]?.id}
                    data-index={virtualItem.index}
                  >
                    {children(flattenedData[virtualItem.index], virtualItem, {
                      data,
                      page: Math.floor(virtualItem.index / 10),
                    })}
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {flattenedData.map((virtualItem: any, index) => {
                return (
                  <React.Fragment key={flattenedData?.[index]?.id ?? index}>
                    {children(
                      flattenedData[index],
                      { ...virtualItem, index },
                      { data, page: Math.floor(index / 10) }
                    )}
                  </React.Fragment>
                );
              })}
            </>
          )}
        </SimpleGrid>
      </div>

      {isFetching && (
        <Flex style={{ height: "75px" }} justify={"center"} align="center">
          {isFetchingNextPage && <Loader />}
        </Flex>
      )}

      {!virtual && hasNextPage && (
        <NextPageFetcher
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}
    </div>
  );
}

function NextPageFetcher({
  start,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  start?: number;
  hasNextPage: any;
  isFetchingNextPage: any;
  fetchNextPage: any;
}) {
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (hasNextPage && inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Flex
      ref={ref}
      style={{ height: "75px" }}
      justify={"center"}
      align="center"
    >
      {isFetchingNextPage && <Loader />}
    </Flex>
  );
}

export default InfiniteScrollComponent;
