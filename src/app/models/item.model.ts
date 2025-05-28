export interface Tag {
  tagId: number;
  name: string;
}

export interface Item {
  itemId: number;
  title: string;
  description: string;
  creditValue: number;
  status: string;
  type: string;
  publicationDate: string;
  userName: string;
  userId: number;
  tagNames: string[];
  tags?: Tag[];
  imageUrl: string;
  userEmail: string;
}
