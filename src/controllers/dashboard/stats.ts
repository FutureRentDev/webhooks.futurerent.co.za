/* eslint-disable @typescript-eslint/no-explicit-any */
import db from "../../db/knex";

export const LeadsStats = async () => {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Get start of current week (Monday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // Get start of current day
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Get all dispositions for counting
    const dispositions = ['new', 'unreachable', 'call back', 'awaiting docs', 'app submitted',
        'approved', 'delivered', 'declined', 'not taken up', 'cancelled',
        'in discussion', 'archive', 're-opened'];

    try {
        // Lifetime counts
        const lifetimeCounts: any = await db('leads')
            .count('id as total')
            .first();

        // Month to Date counts
        const ytdCounts: any = await db('leads')
            .count('id as total')
            .where('created', '>=', startOfYear)
            .first();
        const mtdCounts: any = await db('leads')
            .count('id as total')
            .where('created', '>=', startOfMonth)
            .first();

        // Current day counts
        const todayCounts: any = await db('leads')
            .count('id as total')
            .where('created', '>=', startOfDay)
            .first();

        // Disposition counts for different timeframes
        const dispositionStats: any = {};

        for (const disposition of dispositions) {
            // For "delivered" disposition, use the 'converted' field instead of 'created'
            const isDelivered = disposition === 'delivered';
            const dateField = isDelivered ? 'converted' : 'created';

            const [lifetime, ytd, mtd, today]: any = await Promise.all([
                // Lifetime disposition count
                db('leads')
                    .count('id as count')
                    .where('disposition', disposition)
                    .first(),

                // YTD disposition count
                db('leads')
                    .count('id as count')
                    .where('disposition', disposition)
                    .where(dateField, '>=', startOfYear)
                    .first(),
                
                // MTD disposition count
                db('leads')
                    .count('id as count')
                    .where('disposition', disposition)
                    .where(dateField, '>=', startOfMonth)
                    .first(),

                // Today disposition count
                db('leads')
                    .count('id as count')
                    .where('disposition', disposition)
                    .where(dateField, '>=', startOfDay)
                    .first()
            ]);

            dispositionStats[disposition] = {
                lifetime: parseInt(lifetime?.count || 0),
                ytd: parseInt(ytd?.count || 0),
                mtd: parseInt(mtd?.count || 0),
                today: parseInt(today?.count || 0)
            };
        }

        // Leading sales agents (delivered dispositions) with join to sales_agents table
        const leadingAgents = await db('leads')
            .select([
                'leads.assigned_to',
                'sales_agents.account_name as agent_name',
                db.raw('COUNT(leads.id) as delivered_count')
            ])
            .leftJoin('sales_agents', 'leads.assigned_to', 'sales_agents.id')
            .where('leads.disposition', 'delivered')
            .whereNot('sales_agents.status', '=', 'Inactive')
            .groupBy('leads.assigned_to', 'sales_agents.account_name')
            .orderBy('delivered_count', 'desc');

        // Current year delivered counts by agent with agent name - using converted date
        const currentYearSales = await db('leads')
            .select([
                'leads.assigned_to',
                'sales_agents.account_name as agent_name',
                db.raw('COUNT(leads.id) as count')
            ])
            .leftJoin('sales_agents', 'leads.assigned_to', 'sales_agents.id')
            .where('leads.disposition', 'delivered')
            .whereNot('sales_agents.status', '=', 'Inactive')
            .where('leads.converted', '>=', startOfYear)
            .groupBy('leads.assigned_to', 'sales_agents.account_name');

        // Current month delivered counts by agent with agent name - using converted date
        const currentMonthSales = await db('leads')
            .select([
                'leads.assigned_to',
                'sales_agents.account_name as agent_name',
                db.raw('COUNT(leads.id) as count')
            ])
            .leftJoin('sales_agents', 'leads.assigned_to', 'sales_agents.id')
            .where('leads.disposition', 'delivered')
            .whereNot('sales_agents.status', '=', 'Inactive')
            .where('leads.converted', '>=', startOfMonth)
            .groupBy('leads.assigned_to', 'sales_agents.account_name');

        // Current week delivered counts by agent with agent name - using converted date
        const currentWeekSales = await db('leads')
            .select([
                'leads.assigned_to',
                'sales_agents.account_name as agent_name',
                db.raw('COUNT(leads.id) as count')
            ])
            .leftJoin('sales_agents', 'leads.assigned_to', 'sales_agents.id')
            .where('leads.disposition', 'delivered')
            .whereNot('sales_agents.status', '=', 'Inactive')
            .where('leads.converted', '>=', startOfWeek)
            .groupBy('leads.assigned_to', 'sales_agents.account_name');

        // Current day delivered counts by agent with agent name - using converted date
        const currentDaySales = await db('leads')
            .select([
                'leads.assigned_to',
                'sales_agents.account_name as agent_name',
                db.raw('COUNT(leads.id) as count')
            ])
            .leftJoin('sales_agents', 'leads.assigned_to', 'sales_agents.id')
            .where('leads.disposition', 'delivered')
            .whereNot('sales_agents.status', '=', 'Inactive')
            .where('leads.converted', '>=', startOfDay)
            .groupBy('leads.assigned_to', 'sales_agents.account_name');

        // Format sales agent data
        const salesAgentsStats = leadingAgents.map((agent: any) => {
            const yearData: any = currentYearSales.find(m => m.assigned_to === agent.assigned_to);
            const monthData: any = currentMonthSales.find(m => m.assigned_to === agent.assigned_to);
            const weekData: any = currentWeekSales.find(w => w.assigned_to === agent.assigned_to);
            const dayData: any = currentDaySales.find(d => d.assigned_to === agent.assigned_to);

            return {
                assigned_to: agent.assigned_to,
                agent_name: agent.agent_name || 'Unassigned', // Fallback for null names
                lifetime_delivered: parseInt(agent.delivered_count),
                current_year: parseInt(yearData?.count || 0),
                current_month: parseInt(monthData?.count || 0),
                current_week: parseInt(weekData?.count || 0),
                current_day: parseInt(dayData?.count || 0)
            };
        });

        return {
            totals: {
                lifetime: parseInt(lifetimeCounts?.total || 0),
                ytd: parseInt(ytdCounts?.total || 0),
                mtd: parseInt(mtdCounts?.total || 0),
                today: parseInt(todayCounts?.total || 0)
            },
            dispositions: dispositionStats,
            sales_agents: salesAgentsStats,
            timeframes: {
                current_year: currentDate.getFullYear(),
                current_month: currentDate.getMonth() + 1,
                current_week_start: startOfWeek,
                current_day: startOfDay
            }
        };

    } catch (error) {
        console.error('Error fetching leads stats:', error);
        throw error;
    }
};

export const RevenueSummary = async (timeframe: any = null) => {
    try {
        let query = db('Revenue_Summary').select('*');
        const currentYearMonth = new Date().toISOString().slice(0, 7);
        // Optional: Filter by specific timeframe
        if (timeframe) {
            query = query.where('month', timeframe);
        }
        
        
        const revenueData = await query.orderBy('month', 'asc');
        const latestRevenueData = await query.where('month', currentYearMonth);

        return {
            success: true,
            data: revenueData,
            // timeframes: revenueData.map(row => row.timeframe),
            latest: latestRevenueData || null // Get most recent entry
        };

    } catch (error) {
        console.error('Error fetching revenue summary:', error);
        throw error;
    }
};

export const FleetSummary = async () => {
    try {
        // Query for total fleet count
        const fleetCountQuery = db('vehicles')
            .count('* as fleet_count')
            .where(function() {
                this.whereIn('status', ['Contract', 'Idle', 'Operational', 'Application', 'Repossessed', 'Incident'])
                    .orWhereIn('reason', ['Repo in Progress', 'Defleet in Progress', 'Repossessed', 'Staff Use', 'Delivery in Progress', 'Fleet Sales']);
            })
            .andWhere('isDeleted', 0);

        // Query for available stock (idle/consignment vehicles)
        const availableStockQuery = db('vehicles')
            .count('* as available_stock')
            .whereIn('status', ['Idle', 'Consignment'])
            .whereIn('reason', ['New', '2nd Spin', 'Awaiting NATIS', 'Awaiting Licensing', 'No Reason Required', 'Lease'])
            .andWhere('isDeleted', 0);

        // Query for fleet count by version
        const fleetVersionQueries = [
            // v1: dealer_id < 147
            db('vehicles')
                .count('* as count')
                .where('dealer_id', '<', 147)
                .where(function() {
                    this.whereIn('status', ['Contract', 'Idle', 'Operational', 'Application', 'Repossessed', 'Incident'])
                        .orWhereIn('reason', ['Repo in Progress', 'Defleet in Progress', 'Repossessed', 'Staff Use', 'Delivery in Progress', 'Fleet Sales']);
                })
                .andWhere('isDeleted', 0),

            // v2: dealer_id > 146
            db('vehicles')
                .count('* as count')
                .where('dealer_id', '>', 146)
                .where(function() {
                    this.whereIn('status', ['Contract', 'Idle', 'Operational', 'Application', 'Repossessed', 'Incident'])
                        .orWhereIn('reason', ['Repo in Progress', 'Defleet in Progress', 'Repossessed', 'Staff Use', 'Delivery in Progress', 'Fleet Sales']);
                })
                .andWhere('isDeleted', 0)
        ];

        // Query for vehicle make percentage
        const vehicleMakePercentageQuery = db('vehicles')
            .select(
                'make',
                db.raw('COUNT(*) as make_count'),
                db.raw('(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM vehicles WHERE status IN (?, ?, ?, ?))) as percentage', 
                    ['Sold', 'Contract', 'Idle', 'Operational'])
            )
            .whereIn('status', ['Sold', 'Contract', 'Idle', 'Operational'])
            .groupBy('make')
            .orderBy('percentage', 'desc');

        // Query for total fleet value across all versions
        const totalFleetQuery = db('vehicles')
            .sum('purchase_price as total')
            .where(function() {
                this.whereIn('status', ['Repossessed', 'Contract', 'Operational', 'Defleet in Progress', 'Idle'])
                    .orWhereIn('reason', ['Repo in Progress', 'Defleet in Progress', 'Repossessed']);
            })
            .andWhere('isDeleted', 0);

        // Query for incidents count
        const incidentsQuery = db('vehicles')
            .count('* as incidents')
            .where('status', 'Contract')
            .whereIn('reason', ['Incident-Damage', 'Incident-Theft', 'Incident-Crash'])
            .andWhere('isDeleted', 0);

        // Query for insurance claims (current month)
        const insuranceClaimsQuery = db('insurance_claims')
            .count('* as total_insurance_claims')
            .sum('claim_amount as total_claim_amount')
            .whereRaw('MONTH(incident_date) = MONTH(CURRENT_DATE())')
            .whereRaw('YEAR(incident_date) = YEAR(CURRENT_DATE())');

        // Query for monthly insurance claims data (last 12 months)
        const monthlyInsuranceClaimsQuery = db('insurance_claims')
            .select(
                db.raw("DATE_FORMAT(incident_date, '%Y-%m') as month"),
                db.raw('SUM(claim_amount) as cost'),
                db.raw('COUNT(*) as count')
            )
            .whereRaw('incident_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)')
            .groupByRaw("DATE_FORMAT(incident_date, '%Y-%m')")
            .orderBy('month', 'asc');

        // Query for current month costs breakdown
        const trackerCostsQuery = db('vehicle_costs')
            .count('* as tracker_entries')
            .sum('total as tracker_cost')
            .whereRaw('MONTH(date) = MONTH(CURRENT_DATE())')
            .whereRaw('YEAR(date) = YEAR(CURRENT_DATE())')
            .where('description', 'like', '%Tracker%');

        const serviceCostsQuery = db('vehicle_costs')
            .count('* as service_entries')
            .sum('total as service_cost')
            .whereRaw('MONTH(date) = MONTH(CURRENT_DATE())')
            .whereRaw('YEAR(date) = YEAR(CURRENT_DATE())')
            .where(function() {
                this.where('description', 'not like', '%Tracker%')
                    .orWhereNull('description');
            })
            .where(function() {
                this.where('description', 'not like', '%Lease%')
                    .orWhereNull('description');
            });

        const leaseCostsQuery = db('vehicles')
            .sum('lease_price as lease_cost')
            .count('* as leased_vehicles')
            .whereNotNull('lease_price')
            .where('lease_start', '<=', db.raw('LAST_DAY(CURRENT_DATE())'))
            .where(function() {
                this.whereNull('lease_end')
                    .orWhere('lease_end', '>=', db.raw("DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')"));
            })
            .andWhere('isDeleted', 0);

        // Query for monthly vehicle costs breakdown (last 12 months)
        const monthlyTrackerCostsQuery = db('vehicle_costs')
            .select(
                db.raw("DATE_FORMAT(date, '%Y-%m') as month"),
                db.raw('SUM(total) as Tracker')
            )
            .whereRaw('date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)')
            .where('description', 'like', '%Tracker%')
            .groupByRaw("DATE_FORMAT(date, '%Y-%m')")
            .orderBy('month', 'asc');

        const monthlyServiceCostsQuery = db('vehicle_costs')
            .select(
                db.raw("DATE_FORMAT(date, '%Y-%m') as month"),
                db.raw('SUM(total) as Maintenance_Service')
            )
            .whereRaw('date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)')
            .where(function() {
                this.where('description', 'not like', '%Tracker%')
                    .orWhereNull('description');
            })
            .where(function() {
                this.where('description', 'not like', '%Lease%')
                    .orWhereNull('description');
            })
            .groupByRaw("DATE_FORMAT(date, '%Y-%m')")
            .orderBy('month', 'asc');

        const monthlyLeaseCostsQuery = db('vehicles')
            .select(
                db.raw("DATE_FORMAT(lease_start, '%Y-%m') as month"),
                db.raw('SUM(lease_price) as Lease')
            )
            .whereNotNull('lease_price')
            .where('lease_start', '>=', db.raw('DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)'))
            .where(function() {
                this.whereNull('lease_end')
                    .orWhere('lease_end', '>=', db.raw("DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')"));
            })
            .andWhere('isDeleted', 0)
            .groupByRaw("DATE_FORMAT(lease_start, '%Y-%m')")
            .orderBy('month', 'asc');

        // Query for version-specific fleet values
        const versionQueries = [
            // v1: dealer_id < 147
            db('vehicles')
                .select(db.raw('? as version', ['v1']))
                .sum('purchase_price as fleet_value')
                .where('dealer_id', '<', 147)
                .where(function() {
                    this.whereIn('status', ['Repossessed', 'Contract', 'Operational', 'Defleet in Progress', 'Idle'])
                        .orWhereIn('reason', ['Repo in Progress', 'Defleet in Progress', 'Repossessed']);
                })
                .andWhere('isDeleted', 0),

            // v2: dealer_id > 146
            db('vehicles')
                .select(db.raw('? as version', ['v2']))
                .sum('purchase_price as fleet_value')
                .where('dealer_id', '>', 146)
                .where(function() {
                    this.whereIn('status', ['Repossessed', 'Contract', 'Operational', 'Defleet in Progress', 'Idle'])
                        .orWhereIn('reason', ['Repo in Progress', 'Defleet in Progress', 'Repossessed']);
                })
                .andWhere('isDeleted', 0)
        ];

        // Execute all queries in parallel
        const [
            fleetCountResult,
            availableStockResult,
            v1FleetCountResult,
            v2FleetCountResult,
            vehicleMakePercentageResult,
            totalFleetResult, 
            incidentsResult, 
            insuranceClaimsResult, 
            monthlyInsuranceClaimsResult,
            trackerCostsResult, 
            serviceCostsResult, 
            leaseCostsResult,
            monthlyTrackerCostsResult,
            monthlyServiceCostsResult,
            monthlyLeaseCostsResult,
            ...versionResults
        ]: any = await Promise.all([
            fleetCountQuery,
            availableStockQuery,
            ...fleetVersionQueries,
            vehicleMakePercentageQuery,
            totalFleetQuery,
            incidentsQuery,
            insuranceClaimsQuery,
            monthlyInsuranceClaimsQuery,
            trackerCostsQuery,
            serviceCostsQuery,
            leaseCostsQuery,
            monthlyTrackerCostsQuery,
            monthlyServiceCostsQuery,
            monthlyLeaseCostsQuery,
            ...versionQueries
        ]);

        // Extract fleet data
        const fleet_count = parseInt(fleetCountResult[0]?.fleet_count) || 0;
        const available_stock = parseInt(availableStockResult[0]?.available_stock) || 0;
        const fleet_version = {
            v1: parseInt(v1FleetCountResult[0]?.count) || 0,
            v2: parseInt(v2FleetCountResult[0]?.count) || 0
        };

        // Process vehicle make percentage data
        const vehicle_make_percentage = vehicleMakePercentageResult.map((row: any) => ({
            make: row.make,
            make_count: parseInt(row.make_count) || 0,
            percentage: parseFloat(row.percentage) || 0
        }));

        // Extract values from other results
        const total = parseFloat(totalFleetResult[0]?.total) || 0;
        const incidents = parseInt(incidentsResult[0]?.incidents) || 0;
        const total_insurance_claims = parseInt(insuranceClaimsResult[0]?.total_insurance_claims) || 0;
        const total_claim_amount = parseFloat(insuranceClaimsResult[0]?.total_claim_amount) || 0;
        
        // Process monthly insurance claims data
        const monthly_insurance_data = monthlyInsuranceClaimsResult.map((row: any) => ({
            Month: row.month,
            cost: parseFloat(row.cost) || 0,
            count: parseInt(row.count) || 0
        }));
        
        // Extract current month cost breakdown data
        const trackerEntries = parseInt(trackerCostsResult[0]?.tracker_entries) || 0;
        const trackerCost = parseFloat(trackerCostsResult[0]?.tracker_cost) || 0;
        const serviceEntries = parseInt(serviceCostsResult[0]?.service_entries) || 0;
        const serviceCost = parseFloat(serviceCostsResult[0]?.service_cost) || 0;
        const leaseCost = parseFloat(leaseCostsResult[0]?.lease_cost) || 0;
        const leasedVehicles = parseInt(leaseCostsResult[0]?.leased_vehicles) || 0;

        // Process monthly vehicle costs data
        const monthlyCostsMap = new Map();

        // Process tracker costs
        monthlyTrackerCostsResult.forEach((row: any) => {
            const month = row.month;
            if (!monthlyCostsMap.has(month)) {
                monthlyCostsMap.set(month, { Month: month, Tracker: 0, Maintenance_Service: 0, Lease: 0 });
            }
            monthlyCostsMap.get(month).Tracker = parseFloat(row.Tracker) || 0;
        });

        // Process service costs
        monthlyServiceCostsResult.forEach((row: any) => {
            const month = row.month;
            if (!monthlyCostsMap.has(month)) {
                monthlyCostsMap.set(month, { Month: month, Tracker: 0, Maintenance_Service: 0, Lease: 0 });
            }
            monthlyCostsMap.get(month).Maintenance_Service = parseFloat(row.Maintenance_Service) || 0;
        });

        // Process lease costs
        monthlyLeaseCostsResult.forEach((row: any) => {
            const month = row.month;
            if (!monthlyCostsMap.has(month)) {
                monthlyCostsMap.set(month, { Month: month, Tracker: 0, Maintenance_Service: 0, Lease: 0 });
            }
            monthlyCostsMap.get(month).Lease = parseFloat(row.Lease) || 0;
        });

        // Convert map to array and sort by month
        const monthly_costs_data = Array.from(monthlyCostsMap.values())
            .sort((a, b) => a.Month.localeCompare(b.Month));

        // Build the detailed cost breakdown (following your PHP logic)
        const total_vehicle_cost = {
            Tracker: {
                entries: trackerEntries,
                cost: trackerCost
            },
            Maintenance_Service: {
                entries: serviceEntries,
                cost: serviceCost
            },
            Lease: {
                entries: leasedVehicles,
                cost: leaseCost
            },
            Total: {
                entries: trackerEntries + serviceEntries + leasedVehicles,
                cost: trackerCost + serviceCost + leaseCost
            },
            monthly_data: monthly_costs_data
        };

        // Build versions object
        const versions = {
            v1: parseFloat(versionResults[0][0]?.fleet_value) || 0,
            v2: parseFloat(versionResults[1][0]?.fleet_value) || 0
        };

        return {
            success: true,
            data: {
                fleet: {
                    available_stock,
                    fleet_count,
                    fleet_version,
                    vehicle_make_percentage
                },
                fleet_assets: {
                    total,
                    incidents,
                    versions
                },
                total_insurance_claims: {
                    count: total_insurance_claims,
                    amount: total_claim_amount,
                    monthly_data: monthly_insurance_data
                },
                total_vehicle_cost
            }
        };

    } catch (error) {
        console.error('Error fetching fleet summary:', error);
        throw error;
    }
};

export const SalesSummary = async () => {
    try {
        // Query for total income (rental revenue + deposits)
        const totalIncomeQuery = db('subscriptions')
            .select(
                db.raw('SUM(total_rental) AS rental_revenue'),
                db.raw('SUM(CASE WHEN MONTH(commencement) = MONTH(CURDATE()) AND YEAR(commencement) = YEAR(CURDATE()) THEN deposit ELSE 0 END) AS total_deposits'),
                db.raw('(SUM(total_rental) + SUM(CASE WHEN MONTH(commencement) = MONTH(CURDATE()) AND YEAR(commencement) = YEAR(CURDATE()) THEN deposit ELSE 0 END)) AS total_income')
            )
            .where('status', 'active');

        // Query for converted leads (current month)
        const convertedLeadsQuery = db('subscriptions')
            .count('* as total_new_subscriptions')
            .whereRaw('YEAR(commencement) = YEAR(CURRENT_DATE())')
            .whereRaw('MONTH(commencement) = MONTH(CURRENT_DATE())')
            .andWhere('isDeleted', false);

        // Query for converted leads YTD (year to date)
        const convertedLeadsYTDQuery = db('subscriptions')
            .count('* as total_new_subscriptions')
            .whereRaw('YEAR(commencement) = YEAR(CURRENT_DATE())');

        // Query for total initiation fees (current month deposits)
        const totalInitiationFeesQuery = db('subscriptions')
            .sum('deposit as total_deposits')
            .whereRaw('MONTH(commencement) = MONTH(CURDATE())')
            .whereRaw('YEAR(commencement) = YEAR(CURDATE())');

        // Query for monthly subscriptions data (last 12 months)
        const monthlySubscriptionsQuery = db('subscriptions')
            .select(
                db.raw("DATE_FORMAT(commencement, '%Y-%m') as month"),
                db.raw('COUNT(*) as subscription_count')
            )
            .whereRaw('commencement >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)')
            .andWhere('isDeleted', false)
            .groupByRaw("DATE_FORMAT(commencement, '%Y-%m')")
            .orderBy('month', 'asc');

        // Query for monthly initiation fees data (last 12 months)
        const monthlyInitiationFeesQuery = db('subscriptions')
            .select(
                db.raw("DATE_FORMAT(commencement, '%Y-%m') as month"),
                db.raw('SUM(deposit) as initiation_fees')
            )
            .whereRaw('commencement >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)')
            .andWhere('isDeleted', false)
            .groupByRaw("DATE_FORMAT(commencement, '%Y-%m')")
            .orderBy('month', 'asc');

        // Execute all queries in parallel
        const [
            totalIncomeResult,
            convertedLeadsResult,
            convertedLeadsYTDResult,
            totalInitiationFeesResult,
            monthlySubscriptionsResult,
            monthlyInitiationFeesResult
        ]: any = await Promise.all([
            totalIncomeQuery,
            convertedLeadsQuery,
            convertedLeadsYTDQuery,
            totalInitiationFeesQuery,
            monthlySubscriptionsQuery,
            monthlyInitiationFeesQuery
        ]);

        // Extract values from results
        const rental_revenue = parseFloat(totalIncomeResult[0]?.rental_revenue) || 0;
        const total_deposits = parseFloat(totalIncomeResult[0]?.total_deposits) || 0;
        const total_income = parseFloat(totalIncomeResult[0]?.total_income) || 0;
        const total_new_subscriptions = parseInt(convertedLeadsResult[0]?.total_new_subscriptions) || 0;
        const total_new_subscriptions_ytd = parseInt(convertedLeadsYTDResult[0]?.total_new_subscriptions) || 0;
        const total_initiation_fees_current = parseFloat(totalInitiationFeesResult[0]?.total_deposits) || 0;

        // Process monthly subscriptions data
        const monthly_subscriptions_data = monthlySubscriptionsResult.map((row: any) => ({
            Month: row.month,
            subscription_count: parseInt(row.subscription_count) || 0
        }));

        // Process monthly initiation fees data
        const monthly_initiation_fees_data = monthlyInitiationFeesResult.map((row: any) => ({
            Month: row.month,
            initiation_fees: parseFloat(row.initiation_fees) || 0
        }));

        return {
            success: true,
            data: {
                income: {
                    rental_revenue,
                    total_deposits,
                    total_income
                },
                subscriptions: {
                    current_month: total_new_subscriptions,
                    year_to_date: total_new_subscriptions_ytd,
                    monthly_data: monthly_subscriptions_data
                },
                total_initiation_fees: {
                    current_month: total_initiation_fees_current,
                    monthly_data: monthly_initiation_fees_data
                }
            }
        };

    } catch (error) {
        console.error('Error fetching sales summary:', error);
        throw error;
    }
};

export const CustomerSummary = async () => {
  // Total active customers with v1 and v2 breakdown
  const customerVersions: any = await db
    .select([
      db.raw(`'v1' AS version`),
      db.raw(`COUNT(DISTINCT c.id) AS count`)
    ])
    .from('customers as c')
    .leftJoin('subscriptions as s', 'c.id', 's.customer_id')
    .leftJoin('vehicles as v', 's.vehicle_id', 'v.id')
    .where('c.status', 'Active')
    .andWhere('s.isDeleted', false)
    .andWhere('c.isDeleted', false)
    .andWhere('v.dealer_id', '<', 147)
    .whereNotIn('v.status', ['Sold', 'iOnline Defleet'])
    .unionAll([
      db
        .select([
          db.raw(`'v2' AS version`),
          db.raw(`COUNT(DISTINCT c.id) AS count`)
        ])
        .from('customers as c')
        .leftJoin('subscriptions as s', 'c.id', 's.customer_id')
        .leftJoin('vehicles as v', 's.vehicle_id', 'v.id')
        .where('c.status', 'Active')
        .andWhere('s.isDeleted', false)
        .andWhere('c.isDeleted', false)
        .andWhere('v.dealer_id', '>', 146)
        .whereNotIn('v.status', ['Sold', 'iOnline Defleet'])
    ]);

  let v1 = 0;
  let v2 = 0;
  customerVersions.forEach((row: any) => {
    if (row.version === 'v1') v1 = parseInt(row.count);
    if (row.version === 'v2') v2 = parseInt(row.count);
  });

  const totalActiveCustomers = {
    total: v1 + v2,
    v1,
    v2
  };

  // Income by province
  const incomeByProvince = await db
    .select([
      'c.province',
      db.raw('SUM(s.total_rental) AS total_income'),
      db.raw(`ROUND((SUM(s.total_rental) / 
              (SELECT SUM(total_rental) FROM subscriptions 
               WHERE isDeleted = 0 AND status = 'Active')) * 100, 2) AS income_percentage`)
    ])
    .from('subscriptions as s')
    .join('customers as c', 's.customer_id', 'c.id')
    .where('s.isDeleted', false)
    .andWhere('s.status', 'Active')
    .andWhere('c.isDeleted', false)
    .groupBy('c.province')
    .orderByRaw('SUM(s.total_rental) DESC');

  // Customer demographics (age brackets + license age)
  const demographics = await db
    .select([
      db.raw(`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) BETWEEN 18 AND 25 THEN 1 ELSE 0 END) AS count_18_25`),
      db.raw(`ROUND((SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) BETWEEN 18 AND 25 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS percent_18_25`),
      db.raw(`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) BETWEEN 26 AND 35 THEN 1 ELSE 0 END) AS count_26_35`),
      db.raw(`ROUND((SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) BETWEEN 26 AND 35 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS percent_26_35`),
      db.raw(`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) BETWEEN 36 AND 50 THEN 1 ELSE 0 END) AS count_36_50`),
      db.raw(`ROUND((SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) BETWEEN 36 AND 50 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS percent_36_50`),
      db.raw(`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) BETWEEN 51 AND 60 THEN 1 ELSE 0 END) AS count_51_60`),
      db.raw(`ROUND((SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) BETWEEN 51 AND 60 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS percent_51_60`),
      db.raw(`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) > 60 THEN 1 ELSE 0 END) AS count_over_60`),
      db.raw(`ROUND((SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) > 60 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS percent_over_60`),
      db.raw(`SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.file_drivers, CURDATE()) < 1 THEN 1 ELSE 0 END) AS count_under_1_license`),
      db.raw(`ROUND((SUM(CASE WHEN TIMESTAMPDIFF(YEAR, c.file_drivers, CURDATE()) < 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS percent_under_1_license`)
    ])
    .from('customers as c')
    .join('subscriptions as s', 'c.id', 's.customer_id')
    .where('s.status', 'Active')
    .andWhere('c.isDeleted', false)
    .andWhere('s.isDeleted', false);

  const row = demographics[0];
  const formattedDemographics = [
    { range: '18-25', count: row.count_18_25, percentage: row.percent_18_25 },
    { range: '26-35', count: row.count_26_35, percentage: row.percent_26_35 },
    { range: '36-50', count: row.count_36_50, percentage: row.percent_36_50 },
    { range: '51-60', count: row.count_51_60, percentage: row.percent_51_60 },
    { range: '>60', count: row.count_over_60, percentage: row.percent_over_60 },
    { range: '<1 Year License', count: row.count_under_1_license, percentage: row.percent_under_1_license }
  ];

  return {
    total_active_customers: totalActiveCustomers,
    income_by_province: incomeByProvince,
    demographics: formattedDemographics
  };
};




