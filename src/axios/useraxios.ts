import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./axiosinstance";
import type { UserState } from "../redux/userslice";
// import { Shift } from '../types/attendence';

interface IUser {
  _id: string;
  username: string;
  email: string;
  contactNumber: string;
  role: string;
  shiftStart: string;
  shiftEnd: string;
  address: string;
  gender: string;
  isAvailable: boolean;
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
  total?: string | number | null; // any used before
  deleted?: boolean;
  profilePicture?: File | null | string;
}

interface GetUsersResponse {
  data: IUser[];
  total: number;
}

export const useGetAllUsers = (
  page: number,
  limit: number,
  search: string,
  role: string,
  deleted: boolean
) => {
  return useQuery<GetUsersResponse>({
    queryKey: ["user", page, limit, search, role, deleted],
    queryFn: async () => {
      const response = await api.get<GetUsersResponse>(
        `/api/user/getallusers?page=${page}&limit=${limit}&search=${search}&role=${role}&deleted=${deleted}`
      );
      console.log("response.data", response.data);
      return response.data ?? { data: [], total: 0 };
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      deleted,
    }: {
      userId: string;
      deleted: boolean;
    }) => {
      const response = await api.post(
        `/api/user/delete-user/${userId}/${deleted}`
      );
      return response.data;
    },
  });
};

export const useCurrentUser = () => {
  return useMutation<UserState, Error, string>({
    mutationFn: async (userId: string): Promise<UserState> => {
      try {
        const response = await api.get(`/api/user/getcurrentuser/${userId}`);
        return response.data as UserState;
      } catch (error: any) {
        console.error("Error fetching user:", error);
        throw new Error(
          error?.response?.data?.message || "Failed to fetch user"
        );
      }
    },
  });
};
