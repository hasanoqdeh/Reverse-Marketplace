// MongoDB initialization script
db = db.getSiblingDB('reverse_marketplace');

// Check if this is first run
var versionCollection = db.schema_version.findOne();
if (!versionCollection) {
    print('📋 First run detected - creating MongoDB collections');
    
    // Create collections with indexes
    db.createCollection('bids');
    db.bids.createIndex({ "request_id": 1, "merchant_id": 1 });
    db.bids.createIndex({ "status": 1, "created_at": -1 });
    db.bids.createIndex({ "merchant_id": 1, "created_at": -1 });
    
    db.createCollection('bid_status_history');
    db.bid_status_history.createIndex({ "bid_id": 1, "created_at": -1 });
    
    db.createCollection('bid_analytics');
    db.bid_analytics.createIndex({ "request_id": 1 });
    db.bid_analytics.createIndex({ "date": 1 });
    
    // Create schema version tracking
    db.schema_version.insertOne({
        version: '1.0.0',
        applied_at: new Date(),
        description: 'Initial MongoDB schema'
    });
    
    print('✅ MongoDB initialized successfully');
} else {
    print('🔄 MongoDB already initialized - ready for use');
}
