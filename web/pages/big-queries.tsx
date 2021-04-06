import { x } from "@xstyled/emotion";
import React from "react";
import { Padding } from "../components/Padding";
import { Page } from "../components/Page";
import { useApi } from "../components/useApi";

const get_top_time_slots = () =>
  fetch("/api/big-query/top_time_slots").then(async (res) =>
    res.ok ? res.json() : { error: await res.json() }
  );
const get_top_deficit_countries = () =>
  fetch("/api/big-query/top_deficit_countries").then(async (res) =>
    res.ok ? res.json() : { error: await res.json() }
  );
const get_top_surplus_services = () =>
  fetch("/api/big-query/top_surplus_services").then(async (res) =>
    res.ok ? res.json() : { error: await res.json() }
  );

function DataTable<Key extends string, Row extends Record<Key, any>>(props: {
  headings: { key: Key; label: string }[];
  data?: Row[];
  loadingData?: boolean;
}) {
  return (
    <x.table h="40rem" w="100%" overflow="auto">
      <thead>
        <tr>
          {props.headings.map((heading) => (
            <th key={heading.key}>{heading.label}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {props.loadingData
          ? "Loading..."
          : props.data && props.data.length
          ? props.data.map((row, i) => (
              <tr key={i}>
                {props.headings.map((heading) => (
                  <td key={heading.key}>{row[heading.key]}</td>
                ))}
              </tr>
            ))
          : "No rows!"}
      </tbody>
    </x.table>
  );
}
const BigQueriesPage = () => {
  const topTimeSlots = useApi<{
    rows: [{ time_ref: string; trade_value: number }];
  }>(get_top_time_slots);
  const topDeficitCountries = useApi<{
    rows: [
      {
        country_label: string;
        product_type: string;
        status: string;
        trade_deficit_value: number;
      }
    ];
  }>(get_top_deficit_countries);
  const topSurplusServices = useApi<{
    rows: [{ service_label: string; trade_surplus_value: string }];
  }>(get_top_surplus_services);
  return (
    <Page showNav={false} heading="Queries">
      <Padding />
      <x.div
        display="flex"
        flexDirection="column"
        w="100%"
        p="2rem"
        className="card bg-grey rounded "
      >
        <x.h4 margin={0} py="1rem">
          Top 10 time slots (year and month) with the highest trade value (i.e.
          import value + export value)
        </x.h4>
        <Padding />
        <x.div flex={1}>
          <DataTable
            headings={[
              { key: "time_ref", label: "Time (Year + Month)" },
              {
                key: "trade_value",
                label: "Trade Value (Import + Export value)",
              },
            ]}
            data={topTimeSlots.result?.rows}
            loadingData={topTimeSlots.loading}
          />
        </x.div>
      </x.div>
      <x.div
        display="flex"
        flexDirection="column"
        w="100%"
        p="2rem"
        className="card bg-grey rounded "
      >
        <x.h4 margin={0} py="1rem">
          Top 50 countries with the highest total trade deficit value (i.e.
          import value - export value) of goods from 2014 to 2016 where status
          is “F”
        </x.h4>
        <Padding />
        <x.div flex={1}>
          <DataTable
            headings={[
              { key: "country_label", label: "Country" },
              {
                key: "product_type",
                label: "Product Type",
              },
              {
                key: "trade_deficit_value",
                label: "Trade Deficit (Import - Export value)",
              },
              {
                key: "status",
                label: "Status",
              },
            ]}
            data={topDeficitCountries.result?.rows}
            loadingData={topDeficitCountries.loading}
          />
        </x.div>
      </x.div>
      <x.div
        display="flex"
        flexDirection="column"
        w="100%"
        p="2rem"
        className="card bg-grey rounded "
      >
        <x.h4 margin={0} py="1rem">
          Top 30 services with the highest total trade surplus value (i.e.
          export value - import value) in the top 10 time slots of Query Result
          1 and the top 50 countries of Query Result 2
        </x.h4>
        <Padding />
        <x.div flex={1}>
          <DataTable
            headings={[
              { key: "service_label", label: "Service" },
              {
                key: "trade_surplus_value",
                label: "Trade Surplus (Export - Import value)",
              },
            ]}
            data={topSurplusServices.result?.rows}
            loadingData={topSurplusServices.loading}
          />
        </x.div>
      </x.div>
    </Page>
  );
};

export default BigQueriesPage;
