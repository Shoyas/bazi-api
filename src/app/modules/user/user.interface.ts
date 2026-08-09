export type IUpdateUserStatus = {
  status: 'active' | 'blocked';
};

export type IBulkSoftDelete = {
  userIds: string[];
};
