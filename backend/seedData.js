const bins = [
  { id: 'bin_indira_101', address: '100ft Road, Indiranagar, Bengaluru', location: { lat: 12.9716, lng: 77.6412 }, capacity: '1100L Commercial Compactor', lastPickupDate: '2026-07-23T08:30:00Z', status: 'overflowing', predictiveFlag: true, zone: 'Indiranagar' },
  { id: 'bin_kora_204', address: '5th Block, Koramangala (Opp. Forum)', location: { lat: 12.9352, lng: 77.6245 }, capacity: '660L Standard Wheelie', lastPickupDate: '2026-07-22T10:00:00Z', status: 'normal', predictiveFlag: false, zone: 'Koramangala' },
  { id: 'bin_mg_309', address: 'MG Road Metro Station Exit 2', location: { lat: 12.9756, lng: 77.6066 }, capacity: '1100L Solar Smart Bin', lastPickupDate: '2026-07-21T14:15:00Z', status: 'normal', predictiveFlag: false, zone: 'CBD / MG Road' },
  { id: 'bin_hsr_412', address: '27th Main Road, HSR Layout Sector 1', location: { lat: 12.9121, lng: 77.6445 }, capacity: '660L Organic Bin', lastPickupDate: '2026-07-26T16:00:00Z', status: 'normal', predictiveFlag: false, zone: 'HSR Layout' },
  { id: 'bin_white_505', address: 'ITPL Main Road, Whitefield', location: { lat: 12.987, lng: 77.7312 }, capacity: '1100L Underground Drop', lastPickupDate: '2026-07-20T09:00:00Z', status: 'overflowing', predictiveFlag: true, zone: 'Whitefield' },
  { id: 'bin_jaya_618', address: '4th Block Shopping Complex, Jayanagar', location: { lat: 12.9298, lng: 77.5826 }, capacity: '660L Standard Wheelie', lastPickupDate: '2026-07-27T07:00:00Z', status: 'normal', predictiveFlag: false, zone: 'Jayanagar' }
];

const reports = [
  { id: 'rep_1001', binId: 'bin_kora_204', userId: 'resident_88', userTrustScore: 92, photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop', geminiClassification: { isOverflowing: true, severity: 'high', confidenceScore: 0.96, wasteType: 'Cardboard & packaging waste', recommendation: 'Priority clearance required' }, status: 'pending', reportedAt: '2026-07-25T11:20:00Z' },
  { id: 'rep_1002', binId: 'bin_kora_204', userId: 'resident_42', userTrustScore: 88, photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop', geminiClassification: { isOverflowing: true, severity: 'medium', confidenceScore: 0.91, wasteType: 'Mixed household plastic', recommendation: 'Dispatch within 4 hours' }, status: 'pending', reportedAt: '2026-07-26T14:45:00Z' },
  { id: 'rep_1003', binId: 'bin_mg_309', userId: 'resident_19', userTrustScore: 95, photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop', geminiClassification: { isOverflowing: true, severity: 'high', confidenceScore: 0.98, wasteType: 'Commercial debris & plastic', recommendation: 'Dispatch immediately' }, status: 'pending', reportedAt: '2026-07-25T09:10:00Z' },
  { id: 'rep_1004', binId: 'bin_mg_309', userId: 'resident_77', userTrustScore: 84, photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop', geminiClassification: { isOverflowing: true, severity: 'high', confidenceScore: 0.93, wasteType: 'Plastic food containers', recommendation: 'Immediate pickup' }, status: 'pending', reportedAt: '2026-07-26T18:00:00Z' }
];

module.exports = { bins, reports };
