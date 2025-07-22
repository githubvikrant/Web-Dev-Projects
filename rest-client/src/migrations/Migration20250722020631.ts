import { Migration } from '@mikro-orm/migrations';

export class Migration20250722020631 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`request_history\` add column \`headers\` text null;`);
  }

}
