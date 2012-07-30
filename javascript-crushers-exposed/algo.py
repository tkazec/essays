# Copyright (c) 2006-2010 Berend-Jan "SkyLined" Wever <berendjanwever@gmail.com>
# Project homepage: http://code.google.com/p/jssfx/
# All rights reserved. See COPYRIGHT.txt for details.

def EncodeJavaScriptString(string):
	if string.count('"') < string.count("'"):
		quote = '"';
	else:
		quote = "'";
	result = '';
	replacements = [('\\', '\\\\'), 
									('\r', '\\r'), 
									('\n', '\\n'), 
									(quote, '\\' + quote)];
	encoded_string = string;
	for a, b in replacements:
		encoded_string = encoded_string.replace(a, b);
	return quote + encoded_string + quote;

def FindAllIndicesForSequence(string, sequence):
	indices = [];
	last_index = 0;
	while 1:
		last_index = string.find(sequence, last_index);
		if last_index == -1:
			return indices;
		indices.append(last_index);
		last_index += len(sequence);

def GetMostRepeatedSequence(code, log_level):
	sequences = {};
	repeated_string = None;
	total_bytes = 0;
	# Find all occurances of 1 character strings:
	for i in range(len(code)):
		sequence = code[i:i + 1];
		if sequence not in sequences.keys():
			indices = FindAllIndicesForSequence(code, sequence);
			if len(indices) > 1:
				sequences[sequence] = indices;
	if log_level > 1:
		print 'Found %d characters in code' % len(sequences);
	for sequence_len in range(2, len(code) / 2):
		del_sequences = [];
		new_sequences = {};
		for sequence, indices in sequences.items():
			if len(sequence) == sequence_len - 1:
				for index in indices:
					new_sequence = code[index:index + sequence_len];
					if len(new_sequence) != sequence_len:
						# We have found something at the end of the string and cannot
						# expand it further, eg. expanding the second 'A' in '...AB...A'.
						continue;
					if new_sequence in new_sequences.keys():
						# We have already expanded this string before, eg. expanding the
						# second 'A' in 'ABxxxAB' as opposed to expanding the second 'A'
						# in '...AB...AC...'.
						continue;
					new_indices = FindAllIndicesForSequence(code, new_sequence);
					if len(new_indices) <= 1:
						# This string is not repeated, eg. expanding 'A' to 'AB' in
						# '...AB...A...'.
						continue;
					new_sequences[new_sequence] = new_indices;
					if len(new_indices) == len(indices):
						# We have expanded a string into a string that is repeated exactly
						# as often as the original. This means that we can forget about
						# the original because it is always more efficient to use the
						# longer string, eg. expanding 'A' to 'AB' in '...AB...AB...'.
						del_sequences.append(sequence);
						break;
		if len(new_sequences) == 0:
			# If there are no repeated strings of the current length, then there are
			# definitely no repeated strings of longer length, so we can stop.
			break;
		for sequence in del_sequences:
			del sequences[sequence];
		sequences.update(new_sequences);
		if log_level > 1:
			print 'Found %d sequences of %d characters in code' % (len(new_sequences), sequence_len);

	best_sequence = None;
	best_total_savings = 0;
	for sequence, indices in sequences.items():
		total_savings = (len(sequence) - 1) * len(indices);
		if total_savings > best_total_savings:
			best_total_savings = total_savings;
			best_sequence = sequence;
	if log_level > 1:
		print 'Best sequences is %d characters and saves %d' % (len(best_sequence), best_total_savings);
	return best_sequence;


def EncodeJavaScriptString(string):
	if string.count('"') < string.count("'"):
		quote = '"';
	else:
		quote = "'";
	result = '';
	replaces = [('\\', '\\\\'), 
							('\r', '\\r'), 
							('\n', '\\n'), 
							(quote, '\\' + quote)];
	encoded_string = string;
	for a, b in replaces:
		encoded_string = encoded_string.replace(a, b);
	return quote + encoded_string + quote;


def CreateResult(compressed_code, first_char_code, last_char_code, skip_chars, variable_chars):
	return '%s=%s;' % (variable_chars[0], EncodeJavaScriptString(compressed_code)) + \
				 'for(' + \
						 '%s=%d;' % (variable_chars[1], last_char_code - first_char_code + 1) + \
						 '%s--;' % variable_chars[1] + \
						 '%s=(%s=%s.split(%sString.fromCharCode(%d+%s)))' % (variable_chars[0], variable_chars[2], variable_chars[0], ['', 'r='][skip_chars], first_char_code, variable_chars[1]) + \
								'.join(%s.pop()%s)' % (variable_chars[2], ['', '||r'][skip_chars]) + \
				 ');' + \
				 'eval(%s)' % variable_chars[0];

def JsSfx32(code, valid_chars, valid_chars_description, log_level, quick_and_dirty, use_charat, variable_chars):
	best_result = None;
	best_result_details = None;
	if log_level == 1:
		print '      | JsSfx3.2\r',;
	initial_result = CreateResult(code, 0, 0, False, variable_chars);
	for first_index in range(len(valid_chars)):
		progress = '@ %d%%' % (100*first_index / len(valid_chars));
		first_char = valid_chars[first_index]; first_char_code = ord(first_char);
		results = [(code, initial_result, False)];
		for last_char_code in range(first_char_code, ord(valid_chars[-1])):
			last_char = chr(last_char_code);
			if last_char not in valid_chars:
				break;
			last_char_used = code.find(last_char) != -1;
			new_results = [];
			for data, result, skips_chars in results:
				# See what happens if we skip the character:
				skip_data = data + last_char;
				skip_result = CreateResult(skip_data, first_char_code, last_char_code, True, variable_chars);
				skip_result_details = '%02X-%02X%s' % (first_char_code, last_char_code, '+skips');
				if (not quick_and_dirty and len(EncodeJavaScriptString(last_char)) > 3) or last_char_used:
					# Character needs two chars to encode; it may turn out to be more efficient to skip it
					# or the character exists in the data; we cannot use it for compression:
					new_results.append((skip_data, skip_result, True, skip_result_details));
				# If the character does not exist in the data; see if we can use it for compression:
				if not last_char_used:
					repeated_sequence = GetMostRepeatedSequence(data, log_level);
					if repeated_sequence is not None:
						# Compression may be possible:
						compressed_data = data.replace(repeated_sequence, last_char) + last_char + repeated_sequence;
						compressed_result = CreateResult(compressed_data, first_char_code, last_char_code, skips_chars, variable_chars);
						compressed_result_details = '%02X-%02X%s' % (first_char_code, last_char_code, ['', '+skips'][skips_chars]);
						if len(compressed_result) < len(skip_result):
							new_results.append((compressed_data, compressed_result, skips_chars, compressed_result_details));
			# We now have a list of new results, see which one is the best:
			results = [];
			for data, result, skips_chars, result_details in new_results:
				if best_result is None or len(result) < len(best_result):
					best_result = result;
					best_result_details = result_details;
				results.append((data, result, skips_chars));
			if log_level == 1:
				print ('\r%5d | JsSfx3.2 %s %02X-%02X*%d %s' % (len(best_result), valid_chars_description, \
						first_char_code, last_char_code, len(results), progress)).ljust(80),;
		if log_level == 0:
			print ('\r%5d | JsSfx3.2 %s %02X-%02X*%d %s' % (len(best_result), valid_chars_description, \
					first_char_code, last_char_code, len(results), progress)).ljust(80),;
	if log_level <= 1:
		print ('\r%5d | JsSfx3.2 %s %s done' % \
				(len(best_result), valid_chars_description, best_result_details)).ljust(80);
	return best_result;