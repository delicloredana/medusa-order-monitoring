import { RouteConfig } from "@medusajs/admin";
import { Table, Text, Tooltip } from "@medusajs/ui";
import { Spinner, ExclamationCircle } from "@medusajs/icons";
import { useAdminOrders, useAdminRegions } from "medusa-react";
import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ReactCountryFlag from "react-country-flag";

const OrderMonitoringPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { offset, limit, page, table_height } = React.useMemo(() => {
    return {
      offset: +params.get("offset") || 0,
      limit: +params.get("limit") || 10,
      page:
        params.get("offset") && params.get("limit")
          ? Math.floor(
              (+params.get("offset") + +params.get("limit")) /
                +params.get("limit")
            )
          : 1,
      table_height: ((+params.get("limit") || 10) + 1) * 48,
    };
  }, [location.search, params]);

  const date = React.useMemo(() => {
    const exactDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).setHours(
      0,
      0,
      0,
      0
    );
    return new Date(exactDate);
  }, []);

  const { orders, isLoading, count, error } = useAdminOrders({
    payment_status: ["awaiting"],
    fulfillment_status: ["not_fulfilled"],
    offset,
    limit,
    created_at: {
      gte: date,
    },
    fields: "total,display_id,created_at,email,sales_channel,currency_code,id",
    expand: "shipping_address,sales_channel,payments",
  });
  const { regions } = useAdminRegions();
  const countries = React.useMemo(
    () => regions && regions.flatMap((region) => region.countries),
    [regions]
  );
  const totalPage = React.useMemo(() => {
    return Math.ceil(count / limit);
  }, [count, limit]);

  React.useEffect(() => {
    if (!params.get("offset") || !params.get("limit")) {
      params.set("offset", "0");
      params.set("limit", "10");
      navigate(location.pathname + (params ? "?" + params.toString() : ""));
    }
  }, [location]);

  const handleBackward = React.useCallback(() => {
    if (page > 1) {
      params.set("offset", `${offset - limit}`);
    }
    navigate(location.pathname + (params ? "?" + params.toString() : ""));
  }, [totalPage, offset, limit, page]);

  const handleForward = React.useCallback(() => {
    if (page < totalPage) {
      params.set("offset", `${offset + limit}`);
    }
    navigate(location.pathname + (params ? "?" + params.toString() : ""));
  }, [totalPage, offset, limit, page]);

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg  py-large">
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="flex items-center gap-x-2">
            <ExclamationCircle className="text-ui-fg-base" />
            <Text className="text-ui-fg-subtle">
              An error occurred while loading order monitoring. Reload the page
              and try again. If the issue persists, try again later.
            </Text>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg  py-large">
        <div className="w-full min-h-[600px] flex items-center justify-center">
          <Spinner className=" text-ui-fg-subtle animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg  pt-large">
      <div className="flex items-center justify-between px-8  pb-4">
        <h1 className=" font-medium h1-core">Orders that need attention</h1>
      </div>
      <div
        className="border-ui-border-base relative h-full flex-1 border-b"
        style={{
          minHeight: table_height,
        }}
      >
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Date added</Table.HeaderCell>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Sales Channel</Table.HeaderCell>
              <Table.HeaderCell>Payment</Table.HeaderCell>
              <Table.HeaderCell className=" text-right">Total</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body className="border-b-0">
            {orders &&
              orders.map((order) => {
                return (
                  <Table.Row
                    key={order.id}
                    className=" cursor-pointer [&_td:last-child]:w-[4%] [&_td:last-child]:whi"
                    onClick={() => {
                      navigate(`/a/orders/${order.id}`);
                    }}
                  >
                    <Table.Cell>#{order.display_id}</Table.Cell>
                    <Tooltip
                      align="start"
                      alignOffset={-10}
                      side="bottom"
                      sideOffset={-4}
                      content={new Date(order.created_at).toLocaleString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    >
                      <Table.Cell>
                        {new Date(order.created_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </Table.Cell>
                    </Tooltip>
                    <Table.Cell>{order.email}</Table.Cell>
                    <Table.Cell>{order.sales_channel.name}</Table.Cell>
                    <Table.Cell>
                      {order.payments?.map((payment) => (
                        <span>{payment.provider_id}</span>
                      ))}
                    </Table.Cell>
                    <Table.Cell className=" text-right">
                      {Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: order.currency_code.toUpperCase(),
                      }).format(order.total / 100)}
                    </Table.Cell>
                    <Tooltip
                      side="bottom"
                      
                      sideOffset={-4}
                      // align="end"
                      content={
                        countries?.find(
                          (c) =>
                            c.iso_2 === order.shipping_address?.country_code
                        )?.display_name || "Country"
                      }
                    >
                      <Table.Cell className=" text-right">
                        <ReactCountryFlag
                          className={"rounded"}
                          svg
                          countryCode={order.shipping_address?.country_code}
                        />
                      </Table.Cell>
                    </Tooltip>
                  </Table.Row>
                );
              })}
          </Table.Body>
        </Table>
      </div>
      <Table.Pagination
        count={count ?? 0}
        pageSize={limit || 10}
        pageIndex={page - 1 || 0}
        pageCount={totalPage || 1}
        canPreviousPage={page > 1 || false}
        canNextPage={page < totalPage || false}
        previousPage={handleBackward}
        nextPage={handleForward}
      />
    </div>
  );
};

export const config: RouteConfig = {
  link: {
    label: "Order monitoring",
  },
};

export default OrderMonitoringPage;
