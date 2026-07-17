export const GUESTBOOK_RESOURCE_ID = "__guestbook__";

export function getCommentResourceLabel(resourceId: string) {
  return resourceId === GUESTBOOK_RESOURCE_ID ? "留言板" : `/${resourceId}`;
}