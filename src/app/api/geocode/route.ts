import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: 'Latitude and longitude parameters are required.' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude numbers.' },
        { status: 400 }
      );
    }

    let country = 'India';
    let state = '';
    let district = '';
    let city = '';
    let locality = '';
    let pincode = '';
    let fullAddress = '';

    // Strategy 1: OpenStreetMap Nominatim reverse geocoding
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
      const res = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'VishwakarmaAttaApp/1.0 (info@vishwakarmaatta.com)',
          'Accept-Language': 'en'
        },
        signal: AbortSignal.timeout(5000),
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          country = addr.country || country;
          state = addr.state || addr.province || '';
          district = addr.state_district || addr.county || addr.district || addr.city_district || '';
          city = addr.city || addr.town || addr.village || addr.municipality || district || '';
          locality = addr.suburb || addr.neighbourhood || addr.subdistrict || addr.residential || addr.road || '';
          pincode = addr.postcode || '';
          fullAddress = data.display_name || '';
        }
      }
    } catch (nomErr) {
      // Nominatim timed out or failed, will attempt fallback
    }

    // Strategy 2: BigDataCloud fallback if city or state not detected
    if (!city || !state || !fullAddress) {
      try {
        const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
        const res2 = await fetch(bdcUrl, {
          signal: AbortSignal.timeout(5000),
          cache: 'no-store'
        });

        if (res2.ok) {
          const bdcData = await res2.json();
          if (bdcData) {
            country = bdcData.countryName || country;
            state = state || bdcData.principalSubdivision || '';
            city = city || bdcData.city || bdcData.locality || '';
            locality = locality || bdcData.locality || '';
            pincode = pincode || bdcData.postcode || '';

            // Find district from administrative list if available
            if (!district && Array.isArray(bdcData.localityInfo?.administrative)) {
              const distObj = bdcData.localityInfo.administrative.find((a: any) =>
                a.name && (a.name.toLowerCase().includes('district') || a.order === 9)
              );
              if (distObj) {
                district = distObj.name.replace(/\s+district/i, '');
              }
            }

            if (!fullAddress) {
              const parts = [locality, city, district, state, pincode, country].filter(Boolean);
              fullAddress = Array.from(new Set(parts)).join(', ');
            }
          }
        }
      } catch (bdcErr) {
        // Fallback also failed or timed out
      }
    }

    // If fullAddress still empty, build readable address string
    if (!fullAddress) {
      const parts = [locality, city, district, state, pincode, country].filter(Boolean);
      fullAddress = parts.length > 0 ? Array.from(new Set(parts)).join(', ') : `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        lat,
        lng,
        country: country || 'India',
        state: state || '',
        district: district || '',
        city: city || '',
        locality: locality || '',
        pincode: pincode || '',
        fullAddress: fullAddress || '',
        liveLocationUrl: `https://www.google.com/maps?q=${lat},${lng}`
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to reverse geocode coordinates.' },
      { status: 500 }
    );
  }
}
