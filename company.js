module.exports = async (req, res) => {
    const { phone } = req.query;
    
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }
    
    try {
        const response = await fetch(
            `https://api.airtable.com/v0/appTUSvRn9GseZXVk/tblk2nbqDINfkxnnk?filterByFormula={PrivatePhone}='${phone}'`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.records && data.records.length > 0) {
            const record = data.records[0].fields;
            
            const privateInfo = {
                phone: phone,
                privateId: record.PrivateId || '',
                privateName: record.PrivateName || '',
                privateAffiliation: record.PrivateAffiliation || ''
            };
            
            res.status(200).json(privateInfo);
        } else {
            res.status(404).json({ 
                error: 'Member not found',
                message: `회원 정보를 찾을 수 없습니다.`
            });
        }
    } catch (error) {
        console.error('Airtable API Error:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: '회원 정보를 가져오는 중 오류가 발생했습니다.'
        });
    }
};
