import { ProviderProfile } from '../models/ProviderProfile.model.js';
import { User } from '../models/User.model.js';

export interface AdminProviderQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string; // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
    category?: string;
}

export const getAdminProvidersService = async (params: AdminProviderQueryParams) => {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};
    if (params.status && params.status !== 'ALL') {
        filter.verification_status = params.status.toUpperCase();
    }

    // Populate user profile details
    let profiles = await ProviderProfile.find(filter)
        .populate('user_id', 'name email phone avatar location createdAt')
        .sort({ createdAt: -1 });

    // Format list items
    let formattedList = profiles.map((p: any) => {
        const u = p.user_id || {};
        const appliedDate = p.createdAt || u.createdAt
            ? new Date(p.createdAt || u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Recently Applied';

        return {
            providerProfileId: p._id.toString(),
            userId: u._id?.toString() || '',
            name: u.name || 'Provider Applicant',
            email: u.email || 'provider@example.com',
            phone: u.phone || '+91 98765 43210',
            avatar: u.avatar,
            location: u.location || 'Bhopal, Madhya Pradesh',
            bio: p.bio || 'Professional service provider specializing in home services and technical repairs.',
            experience_years: p.experience_years || 0,
            documents: p.documents || [],
            verification_status: p.verification_status || 'PENDING',
            isApproved: p.isApproved || false,
            is_active: p.is_active || false,
            average_rating: p.average_rating || 4.8,
            total_reviews: p.total_reviews || 0,
            appliedDate: `${appliedDate}`,
            availability: p.availability || [],
        };
    });

    // Apply search filter (matching name, email, phone, or bio)
    if (params.search && params.search.trim() !== '') {
        const query = params.search.trim().toLowerCase();
        formattedList = formattedList.filter((item) =>
            item.name.toLowerCase().includes(query) ||
            item.email.toLowerCase().includes(query) ||
            item.phone.toLowerCase().includes(query) ||
            item.bio.toLowerCase().includes(query)
        );
    }

    // Stats breakdown
    const pendingCount = await ProviderProfile.countDocuments({ verification_status: 'PENDING' });
    const approvedCount = await ProviderProfile.countDocuments({ verification_status: 'APPROVED' });
    const rejectedCount = await ProviderProfile.countDocuments({ verification_status: 'REJECTED' });
    const totalCount = await ProviderProfile.countDocuments();

    // Paginate results
    const totalFiltered = formattedList.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const paginatedItems = formattedList.slice(skip, skip + limit);

    return {
        providers: paginatedItems,
        pagination: {
            currentPage: page,
            totalPages,
            totalProviders: totalFiltered,
            limit,
        },
        stats: {
            total: totalCount,
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
        },
    };
};

export const updateProviderVerificationService = async (
    providerProfileId: string,
    status: 'APPROVED' | 'REJECTED' | 'PENDING'
) => {
    const isApproved = status === 'APPROVED';
    const is_active = status === 'APPROVED';

    const profile = await ProviderProfile.findByIdAndUpdate(
        providerProfileId,
        {
            verification_status: status,
            isApproved,
            is_active,
        },
        { new: true }
    ).populate('user_id', 'name email phone');

    if (!profile) {
        throw new Error('Provider profile not found');
    }

    // Ensure associated User role is set to PROVIDER
    if (profile.user_id) {
        await User.findByIdAndUpdate(profile.user_id._id, { role: 'PROVIDER' });
    }

    return profile;
};
