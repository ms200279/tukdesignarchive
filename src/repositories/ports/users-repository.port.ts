export interface UsersRepository {
  findStudentRegistryIdByProfileId(profileId: string): Promise<number | null>;
}
