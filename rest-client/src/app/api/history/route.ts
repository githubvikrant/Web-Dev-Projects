import { NextRequest, NextResponse } from 'next/server';
import { MikroORM } from '@mikro-orm/core';
import { RequestHistory } from '@/entities/RequestHistory';
import config from '../../../mikro-orm.config';

// Helper to get ORM instance
async function getORM() {
  return MikroORM.init(config);
}

// GET: fetch paginated history
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url!);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const orm = await getORM();
    // Ensure the table exists before querying
    const tables = await orm.em.getConnection().execute('SELECT name FROM sqlite_master WHERE type="table" AND name="request_history"');
    if (tables.length === 0) {
      await orm.getSchemaGenerator().createSchema();
    }
    const em = orm.em.fork();
    const [items, total] = await em.findAndCount(RequestHistory, {}, {
      orderBy: { createdAt: 'desc' },
      limit,
      offset,
    });
    await orm.close();
    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    console.error('GET /api/history error:', error);
    return NextResponse.json({ error: 'Failed to fetch history.' }, { status: 500 });
  }
}

// POST: save a new request/response
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Received headers:', data.headers); // Debug log
    const orm = await getORM();
    // Ensure the table exists before inserting
    const tables = await orm.em.getConnection().execute('SELECT name FROM sqlite_master WHERE type="table" AND name="request_history"');
    if (tables.length === 0) {
      await orm.getSchemaGenerator().createSchema();
    }
    const em = orm.em.fork();
    const entry = em.create(RequestHistory, {
      method: data.method,
      url: data.url,
      requestBody: data.requestBody,
      responseBody: data.responseBody,
      responseStatus: data.responseStatus,
      headers: data.headers, // <-- this should save the string
      createdAt: new Date(),
    });
    console.log('Saving entry.headers:', entry.headers); // Debug log
    await em.persistAndFlush(entry);
    await orm.close();
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('POST /api/history error:', error);
    return NextResponse.json({ error: 'Failed to save history.' }, { status: 500 });
  }
}

// PUT: update a request history entry by id
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updateFields } = data;
    if (!id) {
      return NextResponse.json({ error: 'Missing id for update.' }, { status: 400 });
    }
    const orm = await getORM();
    const em = orm.em.fork();
    const entry = await em.findOne(RequestHistory, { id });
    if (!entry) {
      await orm.close();
      return NextResponse.json({ error: 'Entry not found.' }, { status: 404 });
    }
    Object.assign(entry, updateFields);
    await em.persistAndFlush(entry);
    await orm.close();
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('PUT /api/history error:', error);
    return NextResponse.json({ error: 'Failed to update history.' }, { status: 500 });
  }
}

// DELETE: delete a request history entry by id
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url!);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id for delete.' }, { status: 400 });
    }
    const orm = await getORM();
    const em = orm.em.fork();
    const entry = await em.findOne(RequestHistory, { id: Number(id) });
    if (!entry) {
      await orm.close();
      return NextResponse.json({ error: 'Entry not found.' }, { status: 404 });
    }
    await em.removeAndFlush(entry);
    await orm.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/history error:', error);
    return NextResponse.json({ error: 'Failed to delete history.' }, { status: 500 });
  }
} 