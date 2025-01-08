// Example usage of the GraphQL queries and mutations

describe('GraphQL API Examples', () => {
  it('Store and retrieve data', async () => {
    // 1. Store data
    const storeDataVariables = {
      input: {
        data: { content: "Test content" },
        type: "CUSTOM",
        permissions: "PUBLIC",
        metadata: {
          tags: [
            { name: "category", value: "test" }
          ]
        }
      }
    };

    const storeResult = await graphqlClient.mutate({
      mutation: STORE_DATA,
      variables: storeDataVariables
    });

    // 2. Retrieve stored data
    const getDataVariables = {
      id: storeResult.data.storeData.id
    };

    const getResult = await graphqlClient.query({
      query: GET_DATA,
      variables: getDataVariables
    });

    expect(getResult.data.getData).toBeDefined();
  });

  it('Query data with pagination', async () => {
    const queryVariables = {
      type: "CUSTOM",
      limit: 10,
      cursor: null
    };

    const result = await graphqlClient.query({
      query: QUERY_DATA,
      variables: queryVariables
    });

    expect(result.data.queryData.edges).toBeInstanceOf(Array);
    expect(result.data.queryData.pageInfo).toBeDefined();
  });

  it('Update data permissions', async () => {
    const updateVariables = {
      id: "existing-data-id",
      level: "SHARED",
      allowedUsers: ["user1", "user2"]
    };

    const result = await graphqlClient.mutate({
      mutation: UPDATE_PERMISSIONS,
      variables: updateVariables
    });

    expect(result.data.updatePermissions.permissionLevel).toBe("SHARED");
  });

  it('Transfer tokens', async () => {
    const transferVariables = {
      recipient: "recipient-user-id",
      amount: 100.5
    };

    const result = await graphqlClient.mutate({
      mutation: TRANSFER_TOKENS,
      variables: transferVariables
    });

    expect(result.data.transferTokens).toBeDefined();
  });
}); 