// iPhone Contacts Integration Service

import * as Contacts from 'expo-contacts';
import { ImportedContact, Friend, RelationshipType } from '../types';
import { createFriend, generateId } from './database';

export async function requestContactsPermission(): Promise<boolean> {
  const { status } = await Contacts.requestPermissionsAsync();
  return status === 'granted';
}

export async function hasContactsPermission(): Promise<boolean> {
  const { status } = await Contacts.getPermissionsAsync();
  return status === 'granted';
}

export async function getContactsFromPhone(): Promise<ImportedContact[]> {
  const hasPermission = await hasContactsPermission();
  if (!hasPermission) {
    const granted = await requestContactsPermission();
    if (!granted) return [];
  }

  const { data } = await Contacts.getContactsAsync({
    fields: [
      Contacts.Fields.Name,
      Contacts.Fields.PhoneNumbers,
      Contacts.Fields.Birthday,
      Contacts.Fields.Image,
      Contacts.Fields.RawImage,
      Contacts.Fields.ImageAvailable,
    ],
  });

  return data
    .filter(contact => contact.name) // Only contacts with names
    .map(contact => {
      let birthday: string | undefined;
      if (contact.birthday) {
        const { year, month, day } = contact.birthday;
        if (month !== undefined && day !== undefined) {
          // Month is 0-indexed in expo-contacts
          const y = year || 1900; // Use 1900 if year unknown
          birthday = `${y}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }

      // Try multiple sources for the photo: Image URI, RawImage URI, or base64
      let photo: string | undefined;
      if (contact.imageAvailable) {
        if (contact.image?.uri) {
          photo = contact.image.uri;
        } else if (contact.rawImage?.uri) {
          photo = contact.rawImage.uri;
        } else if (contact.image?.base64) {
          photo = `data:image/png;base64,${contact.image.base64}`;
        } else if (contact.rawImage?.base64) {
          photo = `data:image/png;base64,${contact.rawImage.base64}`;
        }
      }

      return {
        id: contact.id,
        name: contact.name!,
        phone: contact.phoneNumbers?.[0]?.number,
        birthday,
        photo,
      };
    });
}

export async function importContactAsFriend(
  contact: ImportedContact,
  relationshipType: RelationshipType = 'friend',
  contactFrequencyDays: number = 14
): Promise<Friend> {
  const friend = await createFriend({
    id: generateId(),
    name: contact.name,
    photo: contact.photo,
    birthday: contact.birthday,
    phone: contact.phone,
    relationshipType,
    tier: 'other',
    isStarred: false,
    contactFrequencyDays,
    contactId: contact.id,
  });

  return friend;
}

export async function importMultipleContacts(
  contacts: ImportedContact[],
  relationshipType: RelationshipType = 'friend',
  contactFrequencyDays: number = 14
): Promise<Friend[]> {
  const friends: Friend[] = [];

  for (const contact of contacts) {
    const friend = await importContactAsFriend(contact, relationshipType, contactFrequencyDays);
    friends.push(friend);
  }

  return friends;
}

// Search contacts by name
export async function searchContacts(query: string): Promise<ImportedContact[]> {
  const contacts = await getContactsFromPhone();
  const lowerQuery = query.toLowerCase();

  return contacts.filter(contact =>
    contact.name.toLowerCase().includes(lowerQuery)
  );
}
