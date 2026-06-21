import { useState, useEffect, useCallback } from "react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client";

const KV_GET = gql`
  query GetKVItem($key: String!) {
    kvGet(key: $key) {
      key
      value
      updatedAt
    }
  }
`;

const KV_SET = gql`
  mutation SetKVItem($key: String!, $value: String!) {
    kvSet(key: $key, value: $value) {
      key
      value
      updatedAt
    }
  }
`;

/**
 * Platform-aware KV adapter that routes reads/writes through the hootner
 * GraphQL API layer, backed by DynamoDB single-table design.
 * Drop-in replacement for the Spark `useKV()` hook.
 */
export function usePlatformKV<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [data, setData] = useState<T>(defaultValue);
  const client = useApolloClient();

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const result = await client.query({
          query: KV_GET,
          variables: { key },
          fetchPolicy: "network-only",
        });

        if (!cancelled && result.data?.kvGet?.value) {
          setData(JSON.parse(result.data.kvGet.value));
        }
      } catch {
        // On network failure, keep whatever state is already in memory
        // (which may have been updated by component logic).
        // The useState initializer already provides the defaultValue.
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [key, client]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setData((prev) => {
        const nextValue =
          typeof value === "function" ? (value as (prev: T) => T)(prev) : value;

        // Persist to DynamoDB via GraphQL
        client
          .mutate({
            mutation: KV_SET,
            variables: { key, value: JSON.stringify(nextValue) },
          })
          .catch(console.error);

        return nextValue;
      });
    },
    [key, client]
  );

  return [data, setValue];
}

/**
 * Legacy key mapping for Spark KV stores:
 * - "hootner-videos" → DynamoDB: PK=PLATFORM#global, SK=KV#hootner-videos
 * - "hootner-notifications" → DynamoDB: PK=PLATFORM#global, SK=KV#hootner-notifications
 * - "hootner-activities" → DynamoDB: PK=PLATFORM#global, SK=KV#hootner-activities
 * - "hologram-projects" → DynamoDB: PK=PLATFORM#global, SK=KV#hologram-projects
 */
export const KV_KEY_MAP = {
  "hootner-videos": "KV#hootner-videos",
  "hootner-notifications": "KV#hootner-notifications",
  "hootner-activities": "KV#hootner-activities",
  "hootner-sessions": "KV#hootner-sessions",
  "hologram-projects": "KV#hologram-projects",
} as const;
