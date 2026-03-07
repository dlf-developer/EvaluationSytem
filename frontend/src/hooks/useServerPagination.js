import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

export const useServerPagination = (fetchAction, initialParams = {}) => {
  const dispatch = useDispatch();

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    sort: "",
    ...initialParams,
  });

  const fetchData = useCallback(() => {
    // Make sure we don't send empty strings to the backend unnecessarily
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined,
      ),
    );
    dispatch(fetchAction(cleanParams));
  }, [dispatch, fetchAction, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (pagination, filters, sorter) => {
    const newParams = { ...params };

    // Handle pagination
    if (pagination) {
      newParams.page = pagination.current;
      newParams.limit = pagination.pageSize;
    }

    // Handle sorting
    if (sorter && sorter.field) {
      if (sorter.order === "ascend") {
        newParams.sort = sorter.field;
      } else if (sorter.order === "descend") {
        newParams.sort = `-${sorter.field}`;
      } else {
        newParams.sort = ""; // remove sort
      }
    } else {
      newParams.sort = "";
    }

    // Handle custom filters coming from antd table if any
    Object.keys(filters || {}).forEach((key) => {
      // If a filter is clear, antd might pass null or []
      if (filters[key]) {
        // Assume single value for ease or join array
        newParams[key] = Array.isArray(filters[key])
          ? filters[key].join(",")
          : filters[key];
      } else {
        delete newParams[key];
      }
    });

    setParams(newParams);
  };

  const handleSearch = (searchText) => {
    setParams((prev) => ({ ...prev, search: searchText, page: 1 }));
  };

  const handleCustomFilter = (filterName, filterValue) => {
    setParams((prev) => {
      const updated = { ...prev, page: 1 };
      if (filterValue) {
        updated[filterName] = filterValue;
      } else {
        delete updated[filterName];
      }
      return updated;
    });
  };

  const refresh = () => fetchData();

  return {
    params,
    handleTableChange,
    handleSearch,
    handleCustomFilter,
    refresh,
  };
};
