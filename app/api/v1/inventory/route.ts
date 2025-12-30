import { NextResponse } from 'next/server';
import inventories from './data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const brand = searchParams.get('brand');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStockOnly = searchParams.get('inStockOnly');
    const condition = searchParams.get('condition');

    let filteredInventories = [...inventories];

    if (brand) {
      filteredInventories = filteredInventories.filter(
        (bike) => bike.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    if (type) {
      filteredInventories = filteredInventories.filter(
        (bike) => bike.type === type
      );
    }

    if (minPrice) {
      filteredInventories = filteredInventories.filter(
        (bike) => bike.price >= parseFloat(minPrice)
      );
    }

    if (maxPrice) {
      filteredInventories = filteredInventories.filter(
        (bike) => bike.price <= parseFloat(maxPrice)
      );
    }

    if (inStockOnly === 'true') {
      filteredInventories = filteredInventories.filter(
        (bike) => bike.inStock === true
      );
    }

    if (condition) {
      filteredInventories = filteredInventories.filter(
        (bike) => bike.condition === condition
      );
    }

    return NextResponse.json({
      count: filteredInventories.length,
      results: filteredInventories,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching bike inventories:', error);
    return NextResponse.json({
      error: 'Failed to fetch bike inventories',
    }, { status: 500 });
  }
}
