from google.cloud import bigquery
from pydantic import BaseModel


class TimeSlotRow(BaseModel):
    time_ref: str
    trade_value: float


class CountryDeficitRow(BaseModel):
    country_label: str
    product_type: str
    trade_deficit_value: float
    status: str


class ServiceSurplusRow(BaseModel):
    service_label: str
    trade_surplus_value: float


class BigQuery:
    client = bigquery.Client()

    top_ten_time_slots_query = """
SELECT events.time_ref as time_ref, sum(events.value) as trade_value
FROM `services_classification.trade_history` as events
GROUP BY events.time_ref
ORDER BY trade_value DESC
LIMIT 10
        """
    top_deficit_countries_query = """
WITH
  trade_history AS (
  SELECT
    *,
    SUBSTR(trade_history.time_ref, 0, 4) AS year,
    CASE
      WHEN trade_history.account = "Exports" THEN -trade_history.value
    ELSE
    trade_history.value
  END
    AS trade_value
  FROM
    `services_classification.trade_history` AS trade_history
  WHERE
    SUBSTR(trade_history.time_ref, 0, 4) IN ("2014",
      "2015",
      "2016") )
SELECT
  trade_history.country_code,
  ANY_VALUE(countries.country_label) AS country_label,
  ANY_VALUE(trade_history.product_type) AS product_type,
  ANY_VALUE(trade_history.status) AS status,
  SUM(trade_value) AS trade_deficit_value,
FROM
  trade_history
INNER JOIN
  `services_classification.country_classification` AS countries
ON
  trade_history.country_code=countries.country_code
WHERE
  trade_history.status = "F"
  AND trade_history.product_type = "Goods"
GROUP BY
  trade_history.country_code
ORDER BY
  trade_deficit_value DESC
LIMIT 50
        """

    top_surplus_services_query = f"""
SELECT services.code, SUM(CASE WHEN trade_history.account = "Imports" THEN -trade_history.value ELSE trade_history.value END) as trade_surplus_value, ANY_VALUE(services.service_label) as service_label
FROM `services_classification.trade_history` as trade_history
INNER JOIN `services_classification.services_classification` as services ON trade_history.code=services.code
INNER JOIN ({top_deficit_countries_query}) as top_deficit_countries ON top_deficit_countries.country_code=trade_history.country_code
INNER JOIN ({top_ten_time_slots_query}) as top_time_slots ON top_time_slots.time_ref=trade_history.time_ref
GROUP BY services.code
ORDER BY trade_surplus_value DESC
LIMIT 30
        """

    def top_time_slots(self):
        return [
            TimeSlotRow(**row)
            for row in self.client.query(self.top_ten_time_slots_query)
        ]

    def top_deficit_countries(self):
        return [
            CountryDeficitRow(**row)
            for row in self.client.query(self.top_deficit_countries_query)
        ]

    def top_surplus_services(self):
        return [
            ServiceSurplusRow(**row)
            for row in self.client.query(self.top_surplus_services_query)
        ]


big_query = BigQuery()
