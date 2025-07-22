import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class RequestHistory {
  @PrimaryKey()
  id!: number;

  @Property()
  method!: string;

  @Property()
  url!: string;

  @Property({ type: 'text', nullable: true })
  requestBody?: string;

  @Property({ type: 'text', nullable: true })
  responseBody?: string;

  @Property({ type: 'text', nullable: true })
  responseStatus?: string;

  @Property({ type: 'text', nullable: true })
  headers?: string;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  createdAt: Date = new Date();
} 