import { NextRequest, NextResponse } from 'next/server';
import swaggerSpec from '../../../../swagger.json';

export async function GET(request: NextRequest) {
  // Return the OpenAPI specification as JSON
  return NextResponse.json(swaggerSpec);
}
