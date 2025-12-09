module.exports = async (req, res) => {
    const { id } = req.query;
    
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (!id) {
        return res.status(400).json({ error: 'Company ID is required' });
    }
    
    try {
        const response = await fetch(
            `https://api.airtable.com/v0/appTUSvRn9GseZXVk/tblkdRKmvjRjvAfzz?filterByFormula={OrgNameEng}='${id}'`,
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
            
            // 로고 이미지 URL 추출 (Attachment 타입)
            const orgLogoUrl = record.OrgLogo && record.OrgLogo.length > 0 
                ? record.OrgLogo[0].url 
                : null;
            
            const companyInfo = {
                id: id,
                orgName: record.OrgName || '',
                orgNameEng: record.OrgNameEng || '',
                orgLogo: orgLogoUrl
            };
            
            res.status(200).json(companyInfo);
        } else {
            res.status(404).json({ 
                error: 'Company not found',
                message: `기업 ID ${id}를 찾을 수 없습니다.`
            });
        }
    } catch (error) {
        console.error('Airtable API Error:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: '기업 정보를 가져오는 중 오류가 발생했습니다.'
        });
    }
};
